@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Podman環境状況確認スクリプト (Windows)
REM 使用方法: scripts\podman-status.bat

echo 🔍 Podman環境状況確認
echo ========================

set "INFO_PREFIX=[INFO]"
set "WARN_PREFIX=[WARN]"

REM コンテナ状況
echo.
echo !INFO_PREFIX! 📦 コンテナ状況:
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Size}}"

REM ネットワーク状況
echo.
echo !INFO_PREFIX! 🌐 ネットワーク状況:
podman network ls | findstr master-data
if errorlevel 1 echo master-dataネットワークが見つかりません

REM ボリューム状況
echo.
echo !INFO_PREFIX! 💾 ボリューム状況:
podman volume ls | findstr master-data
if errorlevel 1 echo master-dataボリュームが見つかりません

REM ヘルスチェック
echo.
echo !INFO_PREFIX! 🏥 ヘルスチェック:

REM Redis
podman exec master-data-redis redis-cli -a redis123 ping >nul 2>&1
if errorlevel 1 (
    echo   ❌ Redis: 異常
) else (
    echo   ✅ Redis: 正常
)

REM PostgreSQL
podman exec master-data-db pg_isready -U admin -d master_data >nul 2>&1
if errorlevel 1 (
    echo   ❌ PostgreSQL: 異常
) else (
    echo   ✅ PostgreSQL: 正常
)

REM API
curl -s -f http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo   ❌ API: 異常
) else (
    echo   ✅ API: 正常
)

REM Frontend
curl -s -f http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo   ❌ Frontend: 異常
) else (
    echo   ✅ Frontend: 正常
)

REM アクセスURL
echo.
echo !INFO_PREFIX! 🌍 アクセスURL:
echo   フロントエンド: http://localhost:8080
echo   API:           http://localhost:3000
echo   API Health:    http://localhost:3000/health

echo.
echo !INFO_PREFIX! 状況確認完了
pause