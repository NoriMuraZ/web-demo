@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "current_project="
for /f "tokens=*" %%i in ('oc project -q 2^>nul') do set "current_project=%%i"

REM 色付きログ関数の代替（Windows）
set "INFO_PREFIX=[INFO]"
set "WARN_PREFIX=[WARN]"

REM OpenShiftログイン確認
oc whoami >nul 2>&1
if errorlevel 1 (
    echo OpenShiftにログインしていません
    pause
    exit /b 1
)

if "!current_project!"=="" (
    echo プロジェクトが設定されていません
    pause
    exit /b 1
)

echo 🔍 OpenShift リソース監視 - !current_project!
echo ========================================

REM Pod状況
echo.
echo !INFO_PREFIX! 📦 Pod 状況:
oc get pods -o wide

REM Service状況
echo.
echo !INFO_PREFIX! 🌐 Service 状況:
oc get svc

REM Route状況
echo.
echo !INFO_PREFIX! 🔗 Route 状況:
oc get routes

REM リソース使用量
echo.
echo !INFO_PREFIX! 📊 リソース使用量:
oc adm top pods >nul 2>&1
if errorlevel 1 (
    echo メトリクスサーバーが利用できません
) else (
    oc adm top pods
)

REM イベント
echo.
echo !INFO_PREFIX! 📋 最近のイベント:
oc get events --sort-by='.lastTimestamp' 2>nul

REM アクセスURL
echo.
echo !INFO_PREFIX! 🌍 アクセスURL:

set "frontend_url="
set "api_url="

for /f "tokens=*" %%i in ('oc get route master-data-frontend-route -o jsonpath^="{.spec.host}" 2^>nul') do set "frontend_url=%%i"
for /f "tokens=*" %%i in ('oc get route master-data-api-route -o jsonpath^="{.spec.host}" 2^>nul') do set "api_url=%%i"

if "!frontend_url!"=="" set "frontend_url=未設定"
if "!api_url!"=="" set "api_url=未設定"

echo    フロントエンド: https://!frontend_url!
echo    API:           https://!api_url!

REM ヘルスチェック
echo.
echo !INFO_PREFIX! 🏥 ヘルスチェック:

REM API ヘルスチェック
if not "!api_url!"=="未設定" (
    curl -s -f "https://!api_url!/health" >nul 2>&1
    if errorlevel 1 (
        echo    ❌ API: 異常
    ) else (
        echo    ✅ API: 正常
    )
) else (
    echo    ⚠️  API: URL未設定
)

REM フロントエンド ヘルスチェック
if not "!frontend_url!"=="未設定" (
    curl -s -f "https://!frontend_url!" >nul 2>&1
    if errorlevel 1 (
        echo    ❌ フロントエンド: 異常
    ) else (
        echo    ✅ フロントエンド: 正常
    )
) else (
    echo    ⚠️  フロントエンド: URL未設定
)

echo.
echo 🔧 詳細確認コマンド:
echo    oc logs -f deployment/master-data-api
echo    oc logs -f deployment/master-data-frontend
echo    oc logs -f deployment/postgresql
echo    oc logs -f deployment/redis

pause