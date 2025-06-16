@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🔨 OpenShift ビルド状況確認

REM OpenShiftログイン確認
oc whoami >nul 2>&1
if errorlevel 1 (
    echo [ERROR] OpenShiftにログインしていません
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('oc project -q 2^>nul') do set "current_project=%%i"
echo [INFO] 現在のプロジェクト: !current_project!

echo.
echo 📊 ビルド状況:
oc get builds

echo.
echo 📦 ImageStream状況:
oc get imagestreams

echo.
echo 🔍 最新ビルドログ（API）:
echo ----------------------------------------

REM 最新のAPIビルドを取得
set "latest_api_build="
for /f "tokens=*" %%i in ('oc get builds -l buildconfig^=master-data-api-build --sort-by^=.metadata.creationTimestamp -o name 2^>nul ^| findstr /v "^$"') do set "latest_api_build=%%i"

if not "!latest_api_build!"=="" (
    echo 最新APIビルド: !latest_api_build!
    oc logs !latest_api_build! --tail=20 2>nul
) else (
    echo APIビルドが見つかりません
)

echo.
echo 🔍 最新ビルドログ（フロントエンド）:
echo ----------------------------------------

REM 最新のフロントエンドビルドを取得
set "latest_frontend_build="
for /f "tokens=*" %%i in ('oc get builds -l buildconfig^=master-data-frontend-build --sort-by^=.metadata.creationTimestamp -o name 2^>nul ^| findstr /v "^$"') do set "latest_frontend_build=%%i"

if not "!latest_frontend_build!"=="" (
    echo 最新フロントエンドビルド: !latest_frontend_build!
    oc logs !latest_frontend_build! --tail=20 2>nul
) else (
    echo フロントエンドビルドが見つかりません
)

echo.
echo 🔧 ビルド関連コマンド:
echo    oc start-build master-data-api-build     # APIビルド開始
echo    oc start-build master-data-frontend-build # フロントエンドビルド開始
echo    oc logs -f bc/master-data-api-build      # APIビルドログ監視
echo    oc logs -f bc/master-data-frontend-build # フロントエンドビルドログ監視

pause