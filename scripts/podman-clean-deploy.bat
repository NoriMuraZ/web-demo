@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Podman環境クリーンアップ＆デプロイスクリプト (Windows)
REM 使用方法: scripts\podman-clean-deploy.bat

echo 🧹 Podman環境のクリーンアップとデプロイを開始します

set "INFO_PREFIX=[INFO]"
set "WARN_PREFIX=[WARN]"
set "ERROR_PREFIX=[ERROR]"

REM Podmanの確認
podman version >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! Podman がインストールされていません
    pause
    exit /b 1
)

python -c "import podman_compose" >nul 2>&1
if errorlevel 1 (
    echo !ERROR_PREFIX! podman-compose がインストールされていません
    echo !INFO_PREFIX! インストール方法: pip install podman-compose
    pause
    exit /b 1
)

echo !INFO_PREFIX! ✅ Podman環境確認完了

REM 既存のコンテナとリソースを停止・削除
echo !INFO_PREFIX! 🛑 既存のコンテナを停止中...
podman-compose -f podman-compose.yml down --volumes --remove-orphans >nul 2>&1

REM 関連するコンテナを強制削除
echo !INFO_PREFIX! 🗑️ 関連コンテナを削除中...
podman rm -f master-data-api master-data-frontend master-data-db master-data-redis >nul 2>&1

REM 関連するイメージを削除
echo !INFO_PREFIX! 🖼️ 古いイメージを削除中...
podman rmi -f master-data-maintenance-api master-data-maintenance-frontend >nul 2>&1
podman rmi -f localhost/master-data-api:latest localhost/master-data-frontend:latest >nul 2>&1

REM 未使用のリソースをクリーンアップ
echo !INFO_PREFIX! 🧽 未使用リソースをクリーンアップ中...
podman system prune -f --volumes >nul 2>&1

REM ネットワークの削除
echo !INFO_PREFIX! 🌐 ネットワークをクリーンアップ中...
podman network rm master-data-maintenance_master-data-network >nul 2>&1

REM ボリュームの削除確認
echo !WARN_PREFIX! ⚠️  データベースのデータも削除しますか？
set /p "delete_data=データを削除する場合は 'yes' を入力: "

if "!delete_data!"=="yes" (
    echo !WARN_PREFIX! 💾 ボリュームを削除中...
    podman volume rm master-data-maintenance_postgres_data master-data-maintenance_redis_data >nul 2>&1
) else (
    echo !INFO_PREFIX! 💾 既存のデータを保持します
)

REM ログディレクトリの作成
echo !INFO_PREFIX! 📁 ログディレクトリを作成中...
if not exist "api\logs" mkdir "api\logs"

REM イメージのビルド
echo !INFO_PREFIX! 🔨 Dockerイメージをビルド中...

REM APIイメージのビルド
echo !INFO_PREFIX! 📦 APIイメージをビルド中...
podman build -t localhost/master-data-api:latest -f api/Dockerfile api/
if errorlevel 1 (
    echo !ERROR_PREFIX! APIイメージビルドに失敗しました
    pause
    exit /b 1
)

REM フロントエンドイメージのビルド
echo !INFO_PREFIX! 🎨 フロントエンドイメージをビルド中...
podman build -t localhost/master-data-frontend:latest -f Dockerfile.frontend .
if errorlevel 1 (
    echo !ERROR_PREFIX! フロントエンドイメージビルドに失敗しました
    pause
    exit /b 1
)

echo !INFO_PREFIX! ✅ イメージビルド完了

REM podman-composeでサービスを起動
echo !INFO_PREFIX! 🚀 サービスを起動中...
podman-compose -f podman-compose.yml up -d
if errorlevel 1 (
    echo !ERROR_PREFIX! サービス起動に失敗しました
    pause
    exit /b 1
)

REM 起動状況の確認
echo !INFO_PREFIX! ⏳ サービスの起動を待機中...
timeout /t 10 /nobreak >nul

REM ヘルスチェック
echo !INFO_PREFIX! 🔍 ヘルスチェック実行中...

REM Redis確認
podman exec master-data-redis redis-cli -a redis123 ping >nul 2>&1
if errorlevel 1 (
    echo !WARN_PREFIX! ❌ Redis: 異常
) else (
    echo !INFO_PREFIX! ✅ Redis: 正常
)

REM PostgreSQL確認
podman exec master-data-db pg_isready -U admin -d master_data >nul 2>&1
if errorlevel 1 (
    echo !WARN_PREFIX! ❌ PostgreSQL: 異常
) else (
    echo !INFO_PREFIX! ✅ PostgreSQL: 正常
)

REM API確認（少し待ってから）
timeout /t 20 /nobreak >nul
curl -s -f http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo !WARN_PREFIX! ❌ API: 異常（起動中の可能性があります）
) else (
    echo !INFO_PREFIX! ✅ API: 正常
)

REM Frontend確認
curl -s -f http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo !WARN_PREFIX! ❌ Frontend: 異常（起動中の可能性があります）
) else (
    echo !INFO_PREFIX! ✅ Frontend: 正常
)

REM 結果表示
echo.
echo !INFO_PREFIX! 🎉 デプロイ完了！
echo.
echo 📱 アクセスURL:
echo    フロントエンド: http://localhost:8080
echo    API:           http://localhost:3000
echo    API Health:    http://localhost:3000/health
echo.
echo 🔍 監視コマンド:
echo    podman-compose -f podman-compose.yml logs -f
echo    podman-compose -f podman-compose.yml ps
echo.
echo 🛑 停止コマンド:
echo    podman-compose -f podman-compose.yml down
echo.

echo !INFO_PREFIX! デプロイスクリプト完了
pause