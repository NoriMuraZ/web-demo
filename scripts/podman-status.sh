#!/bin/bash

# Podman環境状況確認スクリプト
# 使用方法: ./scripts/podman-status.sh

echo "🔍 Podman環境状況確認"
echo "========================"

# 色付きログ関数
log_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

log_warn() {
    echo -e "\033[33m[WARN]\033[0m $1"
}

# コンテナ状況
echo ""
log_info "📦 コンテナ状況:"
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Size}}"

# ネットワーク状況
echo ""
log_info "🌐 ネットワーク状況:"
podman network ls | grep master-data || echo "master-dataネットワークが見つかりません"

# ボリューム状況
echo ""
log_info "💾 ボリューム状況:"
podman volume ls | grep master-data || echo "master-dataボリュームが見つかりません"

# ヘルスチェック
echo ""
log_info "🏥 ヘルスチェック:"

# Redis
if podman exec master-data-redis redis-cli -a redis123 ping &>/dev/null; then
    echo "  ✅ Redis: 正常"
else
    echo "  ❌ Redis: 異常"
fi

# PostgreSQL
if podman exec master-data-db pg_isready -U admin -d master_data &>/dev/null; then
    echo "  ✅ PostgreSQL: 正常"
else
    echo "  ❌ PostgreSQL: 異常"
fi

# API
if curl -s -f http://localhost:3000/health &>/dev/null; then
    echo "  ✅ API: 正常"
else
    echo "  ❌ API: 異常"
fi

# Frontend
if curl -s -f http://localhost:8080 &>/dev/null; then
    echo "  ✅ Frontend: 正常"
else
    echo "  ❌ Frontend: 異常"
fi

# アクセスURL
echo ""
log_info "🌍 アクセスURL:"
echo "  フロントエンド: http://localhost:8080"
echo "  API:           http://localhost:3000"
echo "  API Health:    http://localhost:3000/health"

echo ""
log_info "状況確認完了"