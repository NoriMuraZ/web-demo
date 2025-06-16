#!/bin/bash

# OpenShift Sandbox デプロイメントスクリプト（修正版）
# 使用方法: ./scripts/deploy-to-sandbox.sh

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

# 現在のプロジェクト確認
CURRENT_PROJECT=$(oc project -q)
log_info "現在のプロジェクト: $CURRENT_PROJECT"

# GitHubリポジトリURL確認
echo ""
log_warn "⚠️  重要: GitHubリポジトリの設定が必要です"
echo "BuildConfigファイル内のGitHubリポジトリURLを実際のリポジトリに変更してください："
echo "  openshift-sandbox/api-buildconfig.yaml"
echo "  openshift-sandbox/frontend-buildconfig.yaml"
echo ""
read -p "GitHubリポジトリの設定は完了していますか？ (yes/no): " github_ready

if [[ $github_ready != "yes" ]]; then
    log_info "GitHubリポジトリの設定を完了してから再実行してください"
    exit 0
fi

# リソースのデプロイ
log_info "設定ファイルをデプロイ中..."
oc apply -f openshift-sandbox/configmap.yaml
oc apply -f openshift-sandbox/secrets.yaml
oc apply -f openshift-sandbox/postgres-init-configmap.yaml

log_info "データベースサービスをデプロイ中..."
oc apply -f openshift-sandbox/redis-deployment.yaml
oc apply -f openshift-sandbox/postgresql-deployment.yaml

# データベースの起動待機
log_info "データベースの起動を待機中..."
sleep 30

# Pod状況確認
log_info "Pod状況確認:"
oc get pods

log_info "ビルド設定をデプロイ中..."
oc apply -f openshift-sandbox/api-buildconfig.yaml
oc apply -f openshift-sandbox/frontend-buildconfig.yaml

# ビルドの開始
log_info "APIビルドを開始中..."
oc start-build master-data-api-build

log_info "フロントエンドビルドを開始中..."
oc start-build master-data-frontend-build

# ビルド状況確認
log_info "ビルド状況確認:"
oc get builds

log_info "アプリケーションをデプロイ中..."
oc apply -f openshift-sandbox/api-deployment.yaml
oc apply -f openshift-sandbox/frontend-deployment.yaml

# 結果表示
echo ""
log_info "🎉 デプロイメント開始完了！"
echo ""

# アクセスURL表示
log_info "📱 アクセスURL（ビルド完了後に利用可能）:"
echo "   フロントエンド: https://master-data-frontend-route-$CURRENT_PROJECT.apps.sandbox-m2.ll9k.p1.openshiftapps.com"
echo "   API:           https://master-data-api-route-$CURRENT_PROJECT.apps.sandbox-m2.ll9k.p1.openshiftapps.com"
echo ""

# ステータス表示
echo "📊 現在の状況:"
oc get pods

echo ""
echo "🔍 監視コマンド:"
echo "   oc get builds -w                    # ビルド状況監視"
echo "   oc get pods -w                      # Pod状況監視"
echo "   oc logs -f bc/master-data-api-build # APIビルドログ"
echo "   oc logs -f bc/master-data-frontend-build # フロントエンドビルドログ"

log_info "デプロイメントスクリプト完了"