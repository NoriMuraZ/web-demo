#!/bin/bash

# OpenShift 監視スクリプト
# 使用方法: ./scripts/monitor-openshift.sh

set -e

NAMESPACE="master-data-maintenance"

# 色付きログ関数
log_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

log_warn() {
    echo -e "\033[33m[WARN]\033[0m $1"
}

# OpenShiftログイン確認
if ! oc whoami &> /dev/null; then
    echo "OpenShiftにログインしていません"
    exit 1
fi

# 名前空間の存在確認
if ! oc get namespace $NAMESPACE &> /dev/null; then
    echo "名前空間 $NAMESPACE は存在しません"
    exit 1
fi

echo "🔍 OpenShift リソース監視 - $NAMESPACE"
echo "========================================"

# Pod状況
echo ""
log_info "📦 Pod 状況:"
oc get pods -n $NAMESPACE -o wide

# Service状況
echo ""
log_info "🌐 Service 状況:"
oc get svc -n $NAMESPACE

# Route状況
echo ""
log_info "🔗 Route 状況:"
oc get routes -n $NAMESPACE

# リソース使用量
echo ""
log_info "📊 リソース使用量:"
if oc adm top pods -n $NAMESPACE &> /dev/null; then
    oc adm top pods -n $NAMESPACE
else
    echo "メトリクスサーバーが利用できません"
fi

# イベント
echo ""
log_info "📋 最近のイベント:"
oc get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10

# アクセスURL
echo ""
log_info "🌍 アクセスURL:"
FRONTEND_URL=$(oc get route master-data-frontend-route -n $NAMESPACE -o jsonpath='{.spec.host}' 2>/dev/null || echo "未設定")
API_URL=$(oc get route master-data-api-route -n $NAMESPACE -o jsonpath='{.spec.host}' 2>/dev/null || echo "未設定")

echo "   フロントエンド: https://$FRONTEND_URL"
echo "   API:           https://$API_URL"

# ヘルスチェック
echo ""
log_info "🏥 ヘルスチェック:"

# API ヘルスチェック
if [[ "$API_URL" != "未設定" ]]; then
    if curl -s -f "https://$API_URL/health" > /dev/null; then
        echo "   ✅ API: 正常"
    else
        echo "   ❌ API: 異常"
    fi
else
    echo "   ⚠️  API: URL未設定"
fi

# フロントエンド ヘルスチェック
if [[ "$FRONTEND_URL" != "未設定" ]]; then
    if curl -s -f "https://$FRONTEND_URL" > /dev/null; then
        echo "   ✅ フロントエンド: 正常"
    else
        echo "   ❌ フロントエンド: 異常"
    fi
else
    echo "   ⚠️  フロントエンド: URL未設定"
fi

echo ""
echo "🔧 詳細確認コマンド:"
echo "   oc logs -f deployment/master-data-api -n $NAMESPACE"
echo "   oc logs -f deployment/master-data-frontend -n $NAMESPACE"
echo "   oc logs -f deployment/postgresql -n $NAMESPACE"
echo "   oc logs -f deployment/redis -n $NAMESPACE"