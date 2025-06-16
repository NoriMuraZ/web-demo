#!/bin/bash

# OpenShift Sandbox デプロイメントスクリプト
# 使用方法: ./scripts/deploy-to-openshift.sh

set -e

echo "🚀 OpenShift Sandbox デプロイメント開始"

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

# OpenShiftログイン確認
if ! oc whoami &> /dev/null; then
    log_error "OpenShiftにログインしていません"
    log_info "以下のコマンドでログインしてください："
    log_info "oc login --token=<your-token> --server=<your-server>"
    exit 1
fi

log_info "OpenShiftログイン確認: $(oc whoami)"

# プロジェクト作成・切り替え
NAMESPACE="master-data-maintenance"
if oc get namespace $NAMESPACE &> /dev/null; then
    log_warn "名前空間 $NAMESPACE は既に存在します"
else
    log_info "名前空間 $NAMESPACE を作成中..."
    oc apply -f openshift/namespace.yaml
fi

oc project $NAMESPACE

# リソースのデプロイ
log_info "設定ファイルをデプロイ中..."
oc apply -f openshift/configmap.yaml
oc apply -f openshift/secrets.yaml
oc apply -f openshift/postgres-init-configmap.yaml

log_info "データベースサービスをデプロイ中..."
oc apply -f openshift/redis-deployment.yaml
oc apply -f openshift/postgresql-deployment.yaml

# データベースの起動待機
log_info "データベースの起動を待機中..."
oc wait --for=condition=available --timeout=300s deployment/redis
oc wait --for=condition=available --timeout=300s deployment/postgresql

log_info "ビルド設定をデプロイ中..."
oc apply -f openshift/api-buildconfig.yaml
oc apply -f openshift/frontend-buildconfig.yaml

# ビルドの開始
log_info "APIビルドを開始中..."
oc start-build master-data-api-build --wait

log_info "フロントエンドビルドを開始中..."
oc start-build master-data-frontend-build --wait

log_info "アプリケーションをデプロイ中..."
oc apply -f openshift/api-deployment.yaml
oc apply -f openshift/frontend-deployment.yaml

# デプロイメントの完了待機
log_info "デプロイメントの完了を待機中..."
oc wait --for=condition=available --timeout=300s deployment/master-data-api
oc wait --for=condition=available --timeout=300s deployment/master-data-frontend

# 結果表示
echo ""
log_info "🎉 デプロイメント完了！"
echo ""

# アクセスURL表示
FRONTEND_URL=$(oc get route master-data-frontend-route -o jsonpath='{.spec.host}' 2>/dev/null || echo "未設定")
API_URL=$(oc get route master-data-api-route -o jsonpath='{.spec.host}' 2>/dev/null || echo "未設定")

echo "📱 アクセスURL:"
echo "   フロントエンド: https://$FRONTEND_URL"
echo "   API:           https://$API_URL"
echo ""

# ステータス表示
echo "📊 デプロイメント状況:"
oc get pods -o wide

echo ""
echo "🔍 詳細確認コマンド:"
echo "   oc get all -n $NAMESPACE"
echo "   oc logs -f deployment/master-data-api -n $NAMESPACE"
echo "   oc logs -f deployment/master-data-frontend -n $NAMESPACE"

log_info "デプロイメントスクリプト完了"