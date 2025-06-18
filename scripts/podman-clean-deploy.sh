#!/bin/bash

# Podman環境クリーンアップ＆デプロイスクリプト
# 使用方法: ./scripts/podman-clean-deploy.sh

set -e

echo "🧹 Podman環境のクリーンアップとデプロイを開始します"

# 色付きログ関数
log_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

log_warn() {
    echo -e "\033[33m[WARN]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# Podmanの確認
if ! command -v podman &> /dev/null; then
    log_error "Podman がインストールされていません"
    exit 1
fi

if ! command -v podman-compose &> /dev/null; then
    log_error "podman-compose がインストールされていません"
    log_info "インストール方法: pip install podman-compose"
    exit 1
fi

log_info "✅ Podman環境確認完了"

# 既存のコンテナとリソースを停止・削除
log_info "🛑 既存のコンテナを停止中..."
podman-compose -f podman-compose.yml down --volumes --remove-orphans 2>/dev/null || true

# 関連するコンテナを強制削除
log_info "🗑️ 関連コンテナを削除中..."
podman rm -f master-data-api master-data-frontend master-data-db master-data-redis 2>/dev/null || true

# 関連するイメージを削除（オプション）
log_info "🖼️ 古いイメージを削除中..."
podman rmi -f master-data-maintenance-api master-data-maintenance-frontend 2>/dev/null || true
podman rmi -f localhost/master-data-api:latest localhost/master-data-frontend:latest 2>/dev/null || true

# 未使用のリソースをクリーンアップ
log_info "🧽 未使用リソースをクリーンアップ中..."
podman system prune -f --volumes 2>/dev/null || true

# ネットワークの削除（存在する場合）
log_info "🌐 ネットワークをクリーンアップ中..."
podman network rm master-data-maintenance_master-data-network 2>/dev/null || true

# ボリュームの削除（データを完全にリセットする場合）
read -p "⚠️  データベースのデータも削除しますか？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_warn "💾 ボリュームを削除中..."
    podman volume rm master-data-maintenance_postgres_data master-data-maintenance_redis_data 2>/dev/null || true
else
    log_info "💾 既存のデータを保持します"
fi

# ログディレクトリの作成
log_info "📁 ログディレクトリを作成中..."
mkdir -p api/logs

# イメージのビルド
log_info "🔨 Dockerイメージをビルド中..."

# APIイメージのビルド
log_info "📦 APIイメージをビルド中..."
podman build -t localhost/master-data-api:latest -f api/Dockerfile api/

# フロントエンドイメージのビルド
log_info "🎨 フロントエンドイメージをビルド中..."
podman build -t localhost/master-data-frontend:latest -f Dockerfile.frontend .

log_info "✅ イメージビルド完了"

# podman-composeでサービスを起動
log_info "🚀 サービスを起動中..."
podman-compose -f podman-compose.yml up -d

# 起動状況の確認
log_info "⏳ サービスの起動を待機中..."
sleep 10

# ヘルスチェック
log_info "🔍 ヘルスチェック実行中..."

# Redis確認
if podman exec master-data-redis redis-cli -a redis123 ping &>/dev/null; then
    log_info "✅ Redis: 正常"
else
    log_warn "❌ Redis: 異常"
fi

# PostgreSQL確認
if podman exec master-data-db pg_isready -U admin -d master_data &>/dev/null; then
    log_info "✅ PostgreSQL: 正常"
else
    log_warn "❌ PostgreSQL: 異常"
fi

# API確認（少し待ってから）
sleep 20
if curl -s -f http://localhost:3000/health &>/dev/null; then
    log_info "✅ API: 正常"
else
    log_warn "❌ API: 異常（起動中の可能性があります）"
fi

# Frontend確認
if curl -s -f http://localhost:8080 &>/dev/null; then
    log_info "✅ Frontend: 正常"
else
    log_warn "❌ Frontend: 異常（起動中の可能性があります）"
fi

# 結果表示
echo ""
log_info "🎉 デプロイ完了！"
echo ""
echo "📱 アクセスURL:"
echo "   フロントエンド: http://localhost:8080"
echo "   API:           http://localhost:3000"
echo "   API Health:    http://localhost:3000/health"
echo ""
echo "🔍 監視コマンド:"
echo "   podman-compose -f podman-compose.yml logs -f"
echo "   podman-compose -f podman-compose.yml ps"
echo ""
echo "🛑 停止コマンド:"
echo "   podman-compose -f podman-compose.yml down"
echo ""

log_info "デプロイスクリプト完了"