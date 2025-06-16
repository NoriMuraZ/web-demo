@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🗑️ OpenShift リソースクリーンアップ開始

REM 色付きログ関数の代替（Windows）
set "INFO_PREFIX=[INFO]"
set "WARN_PREFIX=[WARN]"
set "ERROR_PREFIX=[ERROR]"

REM OpenShiftログイン確認
oc whoami >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! OpenShiftにログインしていません
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('oc project -q 2^>nul') do set "current_project=%%i"

REM 確認プロンプト
echo ⚠️  以下のリソースが削除されます：
echo    - プロジェクト: !current_project!
echo    - 全てのPod、Service、Route
echo    - 全てのデータ（データベース含む）
echo.
set /p "confirm=本当に削除しますか？ (yes/no): "

if not "!confirm!"=="yes" (
    echo !INFO_PREFIX! クリーンアップをキャンセルしました
    pause
    exit /b 0
)

echo !INFO_PREFIX! リソースを削除中...

REM 個別リソース削除
echo !INFO_PREFIX! アプリケーションリソースを削除中...
oc delete all -l app=master-data-api 2>nul
oc delete all -l app=master-data-frontend 2>nul
oc delete all -l app=postgresql 2>nul
oc delete all -l app=redis 2>nul

echo !INFO_PREFIX! ConfigMapとSecretを削除中...
oc delete configmap master-data-config 2>nul
oc delete configmap postgres-init-scripts 2>nul
oc delete secret master-data-secrets 2>nul

echo !INFO_PREFIX! 🎉 クリーンアップ完了！
pause