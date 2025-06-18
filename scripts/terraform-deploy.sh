#!/bin/bash

# Terraform Podman デプロイメントスクリプト
# 使用方法: ./scripts/terraform-deploy.sh [init|plan|apply|destroy]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"

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

# 前提条件チェック
check_prerequisites() {
    log_info "前提条件をチェック中..."
    
    # Terraform チェック
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform がインストールされていません"
        log_info "インストール方法: https://www.terraform.io/downloads"
        exit 1
    fi
    
    # Podman チェック
    if ! command -v podman &> /dev/null; then
        log_error "Podman がインストールされていません"
        log_info "インストール方法: https://podman.io/getting-started/installation"
        exit 1
    fi
    
    # Podman サービス確認
    if ! podman system info &> /dev/null; then
        log_error "Podman サービスが起動していません"
        log_info "以下のコマンドで起動してください:"
        log_info "  systemctl --user start podman.socket"
        exit 1
    fi
    
    log_info "✅ 前提条件チェック完了"
}

# Dockerイメージビルド
build_images() {
    log_info "Dockerイメージをビルド中..."
    
    cd "$PROJECT_ROOT"
    
    # APIイメージビルド
    log_info "APIイメージをビルド中..."
    podman build -t localhost/master-data-api:latest -f api/Dockerfile api/
    
    # フロントエンドイメージビルド
    log_info "フロントエンドイメージをビルド中..."
    podman build -t localhost/master-data-frontend:latest -f Dockerfile.frontend .
    
    log_info "✅ イメージビルド完了"
}

# Terraform初期化
terraform_init() {
    log_info "Terraform を初期化中..."
    
    cd "$TERRAFORM_DIR"
    
    # terraform.tfvars ファイル確認
    if [[ ! -f "terraform.tfvars" ]]; then
        log_warn "terraform.tfvars ファイルが見つかりません"
        log_info "terraform.tfvars.example をコピーして設定してください:"
        log_info "  cp terraform.tfvars.example terraform.tfvars"
        log_info "  vim terraform.tfvars"
        
        # 自動でコピー
        cp terraform.tfvars.example terraform.tfvars
        log_info "terraform.tfvars.example を terraform.tfvars にコピーしました"
        log_warn "設定を確認・編集してから再実行してください"
        exit 1
    fi
    
    terraform init
    log_info "✅ Terraform初期化完了"
}

# Terraform計画
terraform_plan() {
    log_info "Terraform実行計画を作成中..."
    
    cd "$TERRAFORM_DIR"
    terraform validate
    terraform plan -out=tfplan
    
    log_info "✅ 実行計画作成完了"
}

# Terraform適用
terraform_apply() {
    log_info "Terraformを適用中..."
    
    cd "$TERRAFORM_DIR"
    
    if [[ -f "tfplan" ]]; then
        terraform apply tfplan
        rm -f tfplan
    else
        terraform apply
    fi
    
    log_info "✅ Terraform適用完了"
    
    # 出力情報表示
    echo ""
    log_info "📊 デプロイメント情報:"
    terraform output
}

# Terraform破棄
terraform_destroy() {
    log_info "Terraformリソースを破棄中..."
    
    cd "$TERRAFORM_DIR"
    
    log_warn "⚠️  全てのリソースが削除されます"
    read -p "続行しますか？ (yes/no): " confirm
    
    if [[ $confirm == "yes" ]]; then
        terraform destroy
        log_info "✅ リソース破棄完了"
    else
        log_info "破棄をキャンセルしました"
    fi
}

# 状況確認
check_status() {
    log_info "デプロイメント状況を確認中..."
    
    echo ""
    log_info "📦 Podmanコンテナ:"
    podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    log_info "🌐 Podmanネットワーク:"
    podman network ls | grep master-data || echo "ネットワークが見つかりません"
    
    echo ""
    log_info "💾 Podmanボリューム:"
    podman volume ls | grep master-data || echo "ボリュームが見つかりません"
    
    echo ""
    log_info "🔍 ヘルスチェック:"
    
    # API ヘルスチェック
    if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "  ✅ API: 正常"
    else
        echo "  ❌ API: 異常"
    fi
    
    # フロントエンド ヘルスチェック
    if curl -s -f http://localhost:8080 > /dev/null 2>&1; then
        echo "  ✅ フロントエンド: 正常"
    else
        echo "  ❌ フロントエンド: 異常"
    fi
    
    echo ""
    log_info "🌍 アクセスURL:"
    echo "  フロントエンド: http://localhost:8080"
    echo "  API:           http://localhost:3000"
    echo "  API Health:    http://localhost:3000/health"
}

# メイン処理
main() {
    local action="${1:-help}"
    
    case "$action" in
        "init")
            check_prerequisites
            build_images
            terraform_init
            ;;
        "plan")
            check_prerequisites
            terraform_plan
            ;;
        "apply")
            check_prerequisites
            build_images
            terraform_init
            terraform_plan
            terraform_apply
            check_status
            ;;
        "destroy")
            terraform_destroy
            ;;
        "status")
            check_status
            ;;
        "build")
            check_prerequisites
            build_images
            ;;
        "help"|*)
            echo "使用方法: $0 [init|plan|apply|destroy|status|build]"
            echo ""
            echo "コマンド:"
            echo "  init     - Terraform初期化とイメージビルド"
            echo "  plan     - Terraform実行計画の作成"
            echo "  apply    - 完全デプロイメント（推奨）"
            echo "  destroy  - 全リソースの削除"
            echo "  status   - デプロイメント状況確認"
            echo "  build    - Dockerイメージのビルドのみ"
            echo "  help     - このヘルプを表示"
            ;;
    esac
}

# スクリプト実行
main "$@"