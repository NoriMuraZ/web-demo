@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🔧 GitHub リポジトリ設定ヘルパー

set /p "github_username=GitHubユーザー名を入力してください: "
set /p "repo_name=リポジトリ名を入力してください（例: master-data-maintenance）: "

if "!github_username!"=="" (
    echo [ERROR] GitHubユーザー名が入力されていません
    pause
    exit /b 1
)

if "!repo_name!"=="" (
    echo [ERROR] リポジトリ名が入力されていません
    pause
    exit /b 1
)

set "github_url=https://github.com/!github_username!/!repo_name!.git"

echo.
echo 📝 設定するGitHubリポジトリURL: !github_url!
echo.

REM API BuildConfig更新
echo [INFO] API BuildConfigを更新中...
if exist "openshift-sandbox\api-buildconfig.yaml" (
    powershell -Command "$content = Get-Content 'openshift-sandbox\api-buildconfig.yaml' -Raw -Encoding UTF8; $content = $content -replace 'https://github.com/your-username/master-data-maintenance.git', '!github_url!'; Set-Content 'openshift-sandbox\api-buildconfig.yaml' -Value $content -NoNewline -Encoding UTF8"
    if errorlevel 1 (
        echo [ERROR] API BuildConfig更新に失敗しました
    ) else (
        echo API BuildConfig更新完了
    )
) else (
    echo [WARN] openshift-sandbox\api-buildconfig.yaml が見つかりません
)

REM Frontend BuildConfig更新
echo [INFO] Frontend BuildConfigを更新中...
if exist "openshift-sandbox\frontend-buildconfig.yaml" (
    powershell -Command "$content = Get-Content 'openshift-sandbox\frontend-buildconfig.yaml' -Raw -Encoding UTF8; $content = $content -replace 'https://github.com/your-username/master-data-maintenance.git', '!github_url!'; Set-Content 'openshift-sandbox\frontend-buildconfig.yaml' -Value $content -NoNewline -Encoding UTF8"
    if errorlevel 1 (
        echo [ERROR] Frontend BuildConfig更新に失敗しました
    ) else (
        echo Frontend BuildConfig更新完了
    )
) else (
    echo [WARN] openshift-sandbox\frontend-buildconfig.yaml が見つかりません
)

echo.
echo ✅ BuildConfig設定完了！
echo.
echo 📋 次のステップ:
echo 1. プロジェクトをGitHubにプッシュ:
echo    git add .
echo    git commit -m "Initial commit"
echo    git remote add origin !github_url!
echo    git push -u origin main
echo.
echo 2. デプロイメント実行:
echo    scripts\deploy-to-sandbox.bat
echo.

pause