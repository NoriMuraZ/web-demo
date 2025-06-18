@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Terraform Podman デプロイメントスクリプト (Windows)
REM 使用方法: scripts\terraform-deploy.bat [init|plan|apply|destroy|status|build]

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "TERRAFORM_DIR=%PROJECT_ROOT%\terraform"

REM 色付きログ関数の代替
set "INFO_PREFIX=[INFO]"
set "WARN_PREFIX=[WARN]"
set "ERROR_PREFIX=[ERROR]"

REM 引数取得
set "ACTION=%~1"
if "%ACTION%"=="" set "ACTION=help"

REM メイン処理
if "%ACTION%"=="init" goto :init
if "%ACTION%"=="plan" goto :plan
if "%ACTION%"=="apply" goto :apply
if "%ACTION%"=="destroy" goto :destroy
if "%ACTION%"=="status" goto :status
if "%ACTION%"=="build" goto :build
goto :help

:init
echo !INFO_PREFIX! 前提条件をチェック中...
call :check_prerequisites
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! Dockerイメージをビルド中...
call :build_images
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! Terraform を初期化中...
call :terraform_init
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! 初期化完了
goto :end

:plan
echo !INFO_PREFIX! 前提条件をチェック中...
call :check_prerequisites
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! Terraform実行計画を作成中...
call :terraform_plan
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! 実行計画作成完了
goto :end

:apply
echo !INFO_PREFIX! 前提条件をチェック中...
call :check_prerequisites
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! Dockerイメージをビルド中...
call :build_images
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! Terraform を初期化中...
call :terraform_init
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! Terraform実行計画を作成中...
call :terraform_plan
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! Terraformを適用中...
call :terraform_apply
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! デプロイメント状況を確認中...
call :check_status

echo !INFO_PREFIX! デプロイメント完了
goto :end

:destroy
echo !INFO_PREFIX! Terraformリソースを破棄中...
call :terraform_destroy
goto :end

:status
echo !INFO_PREFIX! デプロイメント状況を確認中...
call :check_status
goto :end

:build
echo !INFO_PREFIX! 前提条件をチェック中...
call :check_prerequisites
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! Dockerイメージをビルド中...
call :build_images
if errorlevel 1 exit /b 1

echo !INFO_PREFIX! イメージビルド完了
goto :end

:help
echo 使用方法: %0 [init^|plan^|apply^|destroy^|status^|build]
echo.
echo コマンド:
echo   init     - Terraform初期化とイメージビルド
echo   plan     - Terraform実行計画の作成
echo   apply    - 完全デプロイメント（推奨）
echo   destroy  - 全リソースの削除
echo   status   - デプロイメント状況確認
echo   build    - Dockerイメージのビルドのみ
echo   help     - このヘルプを表示
goto :end

REM 関数定義

:check_prerequisites
REM Terraform チェック
terraform version >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! Terraform がインストールされていません
    echo !INFO_PREFIX! インストール方法: https://www.terraform.io/downloads
    exit /b 1
)

REM Podman チェック
podman version >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! Podman がインストールされていません
    echo !INFO_PREFIX! インストール方法: https://podman.io/getting-started/installation
    exit /b 1
)

REM Podman サービス確認
podman system info >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! Podman サービスが起動していません
    echo !INFO_PREFIX! Podman Desktop を起動してください
    exit /b 1
)

echo !INFO_PREFIX! 前提条件チェック完了
exit /b 0

:build_images
cd /d "!PROJECT_ROOT!"

REM APIイメージビルド
echo !INFO_PREFIX! APIイメージをビルド中...
podman build -t localhost/master-data-api:latest -f api/Dockerfile api/
if errorlevel 1 (
    echo !ERROR_PREFIX! APIイメージビルドに失敗しました
    exit /b 1
)

REM フロントエンドイメージビルド
echo !INFO_PREFIX! フロントエンドイメージをビルド中...
podman build -t localhost/master-data-frontend:latest -f Dockerfile.frontend .
if errorlevel 1 (
    echo !ERROR_PREFIX! フロントエンドイメージビルドに失敗しました
    exit /b 1
)

echo !INFO_PREFIX! イメージビルド完了
exit /b 0

:terraform_init
cd /d "!TERRAFORM_DIR!"

REM terraform.tfvars ファイル確認
if not exist "terraform.tfvars" (
    echo !WARN_PREFIX! terraform.tfvars ファイルが見つかりません
    echo !INFO_PREFIX! terraform.tfvars.example をコピーして設定してください
    
    copy terraform.tfvars.example terraform.tfvars >nul
    echo !INFO_PREFIX! terraform.tfvars.example を terraform.tfvars にコピーしました
    echo !WARN_PREFIX! 設定を確認・編集してから再実行してください
    exit /b 1
)

terraform init
if errorlevel 1 (
    echo !ERROR_PREFIX! Terraform初期化に失敗しました
    exit /b 1
)

echo !INFO_PREFIX! Terraform初期化完了
exit /b 0

:terraform_plan
cd /d "!TERRAFORM_DIR!"

terraform validate
if errorlevel 1 (
    echo !ERROR_PREFIX! Terraform設定の検証に失敗しました
    exit /b 1
)

terraform plan -out=tfplan
if errorlevel 1 (
    echo !ERROR_PREFIX! Terraform計画作成に失敗しました
    exit /b 1
)

exit /b 0

:terraform_apply
cd /d "!TERRAFORM_DIR!"

if exist "tfplan" (
    terraform apply tfplan
    del tfplan >nul 2>&1
) else (
    terraform apply
)

if errorlevel 1 (
    echo !ERROR_PREFIX! Terraform適用に失敗しました
    exit /b 1
)

echo.
echo !INFO_PREFIX! デプロイメント情報:
terraform output

exit /b 0

:terraform_destroy
cd /d "!TERRAFORM_DIR!"

echo !WARN_PREFIX! 全てのリソースが削除されます
set /p "confirm=続行しますか？ (yes/no): "

if "!confirm!"=="yes" (
    terraform destroy
    if errorlevel 1 (
        echo !ERROR_PREFIX! リソース破棄に失敗しました
        exit /b 1
    )
    echo !INFO_PREFIX! リソース破棄完了
) else (
    echo !INFO_PREFIX! 破棄をキャンセルしました
)

exit /b 0

:check_status
echo.
echo !INFO_PREFIX! Podmanコンテナ:
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo !INFO_PREFIX! Podmanネットワーク:
for /f "tokens=*" %%i in ('podman network ls ^| findstr master-data 2^>nul') do echo %%i
if errorlevel 1 echo ネットワークが見つかりません

echo.
echo !INFO_PREFIX! Podmanボリューム:
for /f "tokens=*" %%i in ('podman volume ls ^| findstr master-data 2^>nul') do echo %%i
if errorlevel 1 echo ボリュームが見つかりません

echo.
echo !INFO_PREFIX! ヘルスチェック:

REM API ヘルスチェック
curl -s -f http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo   API: 異常
) else (
    echo   API: 正常
)

REM フロントエンド ヘルスチェック
curl -s -f http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo   フロントエンド: 異常
) else (
    echo   フロントエンド: 正常
)

echo.
echo !INFO_PREFIX! アクセスURL:
echo   フロントエンド: http://localhost:8080
echo   API:           http://localhost:3000
echo   API Health:    http://localhost:3000/health

exit /b 0

:end
pause