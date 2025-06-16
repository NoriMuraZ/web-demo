#!/bin/bash

# OpenShift リソースクリーンアップスクリプト
# 使用方法: ./scripts/cleanup-openshift.sh

set -e

echo "🗑️ OpenShift リソースクリーンアップ開始"

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
    exit 1
fi

NAMESPACE="master-data-maintenance"

# 確認プロンプト
echo "⚠️  以下のリソースが削除されます："
echo "   - 名前空間: $NAMESPACE"
echo "   - 全てのPod、Service、Route"
echo "   - 全てのデータ（データベース含む）"
echo ""
read -p "本当に削除しますか？ (yes/no): " confirm

if [[ $confirm != "yes" ]]; then
    log_info "クリーンアップをキャンセルしました"
    exit 0
fi

# 名前空間の存在確認
if ! oc get namespace $NAMESPACE &> /dev/null; then
    log_warn "名前空間 $NAMESPACE は存在しません"
    exit 0
fi

log_info "名前空間 $NAMESPACE を削除中..."
oc delete namespace $NAMESPACE

log_info "削除完了を待機中..."
while oc get namespace $NAMESPACE &> /dev/null; do
    echo -n "."
    sleep 2
done

echo ""
log_info "🎉 クリーンアップ完了！"