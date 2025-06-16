@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 OpenShift Sandbox デプロイメント開始

REM 色付きログ関数の代替（Windows）
set "INFO_PREFIX=[INFO]"
set "WARN_PREFIX=[WARN]"
set "ERROR_PREFIX=[ERROR]"

REM OpenShiftログイン確認
oc whoami >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! OpenShiftにログインしていません
    echo !INFO_PREFIX! 以下のコマンドでログインしてください：
    echo oc login --token=^<your-token^> --server=^<your-server^>
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('oc whoami 2^>nul') do set "current_user=%%i"
echo !INFO_PREFIX! OpenShiftログイン確認: !current_user!

REM 現在のプロジェクト確認
for /f "tokens=*" %%i in ('oc project -q 2^>nul') do set "current_project=%%i"
echo !INFO_PREFIX! 現在のプロジェクト: !current_project!

REM GitHubリポジトリURL確認
echo.
echo !WARN_PREFIX! ⚠️  重要: GitHubリポジトリの設定が必要です
echo BuildConfigファイル内のGitHubリポジトリURLを実際のリポジトリに変更してください：
echo   openshift-sandbox/api-buildconfig.yaml
echo   openshift-sandbox/frontend-buildconfig.yaml
echo.
set /p "github_ready=GitHubリポジトリの設定は完了していますか？ (yes/no): "

if not "!github_ready!"=="yes" (
    echo !INFO_PREFIX! GitHubリポジトリの設定を完了してから再実行してください
    pause
    exit /b 0
)

REM リソースのデプロイ
echo !INFO_PREFIX! 設定ファイルをデプロイ中...
oc apply -f openshift-sandbox/configmap.yaml
if errorlevel 1 echo !ERROR_PREFIX! ConfigMap適用でエラーが発生しました

oc apply -f openshift-sandbox/secrets.yaml
if errorlevel 1 echo !ERROR_PREFIX! Secret適用でエラーが発生しました

oc apply -f openshift-sandbox/postgres-init-configmap.yaml
if errorlevel 1 echo !ERROR_PREFIX! PostgreSQL初期化ConfigMap適用でエラーが発生しました

echo !INFO_PREFIX! データベースサービスをデプロイ中...
oc apply -f openshift-sandbox/redis-deployment.yaml
if errorlevel 1 echo !ERROR_PREFIX! Redis適用でエラーが発生しました

oc apply -f openshift-sandbox/postgresql-deployment.yaml
if errorlevel 1 echo !ERROR_PREFIX! PostgreSQL適用でエラーが発生しました

REM データベースの起動待機
echo !INFO_PREFIX! データベースの起動を待機中...
timeout /t 30 /nobreak >nul

REM Pod状況確認
echo !INFO_PREFIX! Pod状況確認:
oc get pods

echo !INFO_PREFIX! ビルド設定をデプロイ中...
oc apply -f openshift-sandbox/api-buildconfig.yaml
if errorlevel 1 echo !ERROR_PREFIX! API BuildConfig適用でエラーが発生しました

oc apply -f openshift-sandbox/frontend-buildconfig.yaml
if errorlevel 1 echo !ERROR_PREFIX! Frontend BuildConfig適用でエラーが発生しました

REM ビルドの開始
echo !INFO_PREFIX! APIビルドを開始中...
oc start-build master-data-api-build
if errorlevel 1 echo !ERROR_PREFIX! APIビルド開始でエラーが発生しました

echo !INFO_PREFIX! フロントエンドビルドを開始中...
oc start-build master-data-frontend-build
if errorlevel 1 echo !ERROR_PREFIX! フロントエンドビルド開始でエラーが発生しました

REM ビルド状況確認
echo !INFO_PREFIX! ビルド状況確認:
oc get builds

echo !INFO_PREFIX! アプリケーションをデプロイ中...
oc apply -f openshift-sandbox/api-deployment.yaml
if errorlevel 1 echo !ERROR_PREFIX! API Deployment適用でエラーが発生しました

oc apply -f openshift-sandbox/frontend-deployment.yaml
if errorlevel 1 echo !ERROR_PREFIX! Frontend Deployment適用でエラーが発生しました

REM 結果表示
echo.
echo !INFO_PREFIX! 🎉 デプロイメント開始完了！
echo.

REM アクセスURL表示
echo !INFO_PREFIX! 📱 アクセスURL（ビルド完了後に利用可能）:
echo    フロントエンド: https://master-data-frontend-route-!current_project!.apps.sandbox-m2.ll9k.p1.openshiftapps.com
echo    API:           https://master-data-api-route-!current_project!.apps.sandbox-m2.ll9k.p1.openshiftapps.com
echo.

REM ステータス表示
echo 📊 現在の状況:
oc get pods

echo.
echo 🔍 監視コマンド:
echo    oc get builds -w                    # ビルド状況監視
echo    oc get pods -w                      # Pod状況監視
echo    oc logs -f bc/master-data-api-build # APIビルドログ
echo    oc logs -f bc/master-data-frontend-build # フロントエンドビルドログ

echo !INFO_PREFIX! デプロイメントスクリプト完了
pause