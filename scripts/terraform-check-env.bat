@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Terraform Podman 環境チェックスクリプト (Windows)
REM 使用方法: scripts\terraform-check-env.bat

echo ========================================
echo Terraform Podman 環境チェック
echo ========================================
echo.

set "INFO_PREFIX=[INFO]"
set "WARN_PREFIX=[WARN]"
set "ERROR_PREFIX=[ERROR]"
set "OK_PREFIX=[OK]"

REM 1. 基本ツールの確認
echo !INFO_PREFIX! 基本ツールの確認中...
echo.

REM Terraform確認
terraform version >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! Terraform が見つかりません
    echo !INFO_PREFIX! インストール方法: https://www.terraform.io/downloads
    echo !INFO_PREFIX! または: choco install terraform
) else (
    for /f "tokens=*" %%i in ('terraform version 2^>nul ^| findstr "Terraform"') do echo !OK_PREFIX! %%i
)

REM Podman確認
podman version >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! Podman が見つかりません
    echo !INFO_PREFIX! インストール方法: https://podman-desktop.io/downloads
) else (
    for /f "tokens=*" %%i in ('podman version --format "{{.Client.Version}}" 2^>nul') do echo !OK_PREFIX! Podman %%i
)

REM curl確認
curl --version >nul 2>&1
if errorlevel 1 (
    echo !WARN_PREFIX! curl が見つかりません（ヘルスチェックに影響）
    echo !INFO_PREFIX! Windows 10/11には標準で含まれています
) else (
    for /f "tokens=*" %%i in ('curl --version 2^>nul ^| findstr "curl"') do echo !OK_PREFIX! %%i
)

echo.

REM 2. Podmanサービスの確認
echo !INFO_PREFIX! Podmanサービスの確認中...
echo.

podman system info >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! Podman サービスが起動していません
    echo !INFO_PREFIX! Podman Desktop を起動してください
    echo !INFO_PREFIX! または WSL2 が正しく設定されているか確認してください
) else (
    echo !OK_PREFIX! Podman サービス: 正常
    
    REM Podman マシン情報
    for /f "tokens=*" %%i in ('podman machine list 2^>nul ^| findstr "Currently running"') do echo !OK_PREFIX! %%i
)

echo.

REM 3. ネットワーク接続の確認
echo !INFO_PREFIX! ネットワーク接続の確認中...
echo.

REM インターネット接続確認
ping -n 1 8.8.8.8 >nul 2>&1
if errorlevel 1 (
    echo !WARN_PREFIX! インターネット接続に問題があります
) else (
    echo !OK_PREFIX! インターネット接続: 正常
)

REM Terraform Registry接続確認
curl -s --connect-timeout 5 https://registry.terraform.io >nul 2>&1
if errorlevel 1 (
    echo !WARN_PREFIX! Terraform Registry への接続に問題があります
    echo !INFO_PREFIX! プロキシ設定を確認してください
) else (
    echo !OK_PREFIX! Terraform Registry接続: 正常
)

echo.

REM 4. ファイルシステムの確認
echo !INFO_PREFIX! ファイルシステムの確認中...
echo.

set "PROJECT_ROOT=%~dp0.."
set "TERRAFORM_DIR=%PROJECT_ROOT%\terraform"

if exist "!TERRAFORM_DIR!\main.tf" (
    echo !OK_PREFIX! Terraformファイル: 存在
) else (
    echo !ERROR_PREFIX! Terraformファイルが見つかりません
)

if exist "!PROJECT_ROOT!\api\Dockerfile" (
    echo !OK_PREFIX! API Dockerfile: 存在
) else (
    echo !ERROR_PREFIX! API Dockerfileが見つかりません
)

if exist "!PROJECT_ROOT!\Dockerfile.frontend" (
    echo !OK_PREFIX! Frontend Dockerfile: 存在
) else (
    echo !ERROR_PREFIX! Frontend Dockerfileが見つかりません
)

if exist "!TERRAFORM_DIR!\terraform.tfvars" (
    echo !OK_PREFIX! terraform.tfvars: 存在
) else (
    echo !WARN_PREFIX! terraform.tfvars が見つかりません
    echo !INFO_PREFIX! terraform.tfvars.example をコピーして設定してください
)

echo.

REM 5. ポート使用状況の確認
echo !INFO_PREFIX! ポート使用状況の確認中...
echo.

REM 主要ポートの確認
set "PORTS=3000 5432 6379 8080"
for %%p in (!PORTS!) do (
    netstat -ano | findstr ":%%p " >nul 2>&1
    if errorlevel 1 (
        echo !OK_PREFIX! ポート %%p: 利用可能
    ) else (
        echo !WARN_PREFIX! ポート %%p: 使用中
        for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":%%p "') do (
            for /f "tokens=1" %%j in ('tasklist /FI "PID eq %%i" /FO CSV /NH 2^>nul') do (
                echo !INFO_PREFIX!   プロセス: %%j ^(PID: %%i^)
            )
        )
    )
)

echo.

REM 6. システムリソースの確認
echo !INFO_PREFIX! システムリソースの確認中...
echo.

REM メモリ確認
for /f "tokens=2 delims==" %%i in ('wmic OS get TotalVisibleMemorySize /value 2^>nul ^| findstr "="') do set "TOTAL_MEMORY=%%i"
for /f "tokens=2 delims==" %%i in ('wmic OS get FreePhysicalMemory /value 2^>nul ^| findstr "="') do set "FREE_MEMORY=%%i"

if defined TOTAL_MEMORY (
    set /a "TOTAL_GB=!TOTAL_MEMORY!/1024/1024"
    set /a "FREE_GB=!FREE_MEMORY!/1024/1024"
    echo !OK_PREFIX! メモリ: !FREE_GB!GB / !TOTAL_GB!GB 利用可能
    
    if !FREE_GB! LSS 2 (
        echo !WARN_PREFIX! 利用可能メモリが少なくなっています
    )
) else (
    echo !WARN_PREFIX! メモリ情報を取得できませんでした
)

REM ディスク容量確認
for /f "tokens=3" %%i in ('dir /-c 2^>nul ^| findstr "バイト"') do set "FREE_SPACE=%%i"
if defined FREE_SPACE (
    echo !OK_PREFIX! ディスク容量: 十分
) else (
    echo !WARN_PREFIX! ディスク容量情報を取得できませんでした
)

echo.

REM 7. 文字エンコーディングの確認
echo !INFO_PREFIX! 文字エンコーディングの確認中...
echo.

for /f "tokens=*" %%i in ('chcp 2^>nul') do (
    echo %%i | findstr "65001" >nul
    if errorlevel 1 (
        echo !WARN_PREFIX! 文字エンコーディング: %%i
        echo !INFO_PREFIX! UTF-8に設定することを推奨します: chcp 65001
    ) else (
        echo !OK_PREFIX! 文字エンコーディング: UTF-8 ^(%%i^)
    )
)

echo.

REM 8. 推奨事項の表示
echo !INFO_PREFIX! 推奨事項:
echo.
echo 1. 全ての前提条件が満たされていることを確認してください
echo 2. terraform.tfvars ファイルを設定してください
echo 3. 使用中のポートがある場合は、設定を変更するか停止してください
echo 4. 十分なシステムリソースがあることを確認してください
echo.
echo 準備ができたら以下のコマンドでデプロイを開始してください:
echo   scripts\terraform-deploy.bat apply
echo.

pause