# Terraform Podman デプロイメントガイド

## 📋 概要

このガイドでは、TerraformとPodmanを使用してマスターデータメンテナンスシステムをInfrastructure as Code (IaC) として構築・管理する方法を説明します。

## 🎯 メリット

### Infrastructure as Code (IaC)
- **バージョン管理**: インフラ設定をGitで管理
- **再現性**: 同じ環境を何度でも構築可能
- **自動化**: 手動作業の削減とヒューマンエラー防止
- **ドキュメント化**: コードがそのままドキュメント

### Terraform + Podman の利点
- **軽量**: Dockerよりもリソース効率が良い
- **セキュリティ**: Rootless実行でセキュリティ向上
- **互換性**: Docker Composeとの高い互換性
- **管理性**: Terraformによる宣言的な設定管理

## 🏗️ アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Terraform管理層                          │
│  Infrastructure as Code (IaC) による自動化                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Podmanコンテナ層                         │
│  Frontend + API + Database + Redis + Network + Volumes     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ホストOS層                               │
│  Linux/Windows/macOS + Podman Runtime                     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 クイックスタート

### 1. 前提条件のインストール

#### Linux (Ubuntu/Debian)
```bash
# Terraform インストール
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Podman インストール
sudo apt update && sudo apt install podman
```

#### Windows
```powershell
# Chocolatey経由でインストール
choco install terraform podman-desktop

# または手動インストール
# Terraform: https://www.terraform.io/downloads
# Podman Desktop: https://podman-desktop.io/downloads
```

#### macOS
```bash
# Homebrew経由でインストール
brew install terraform podman
```

### 2. 自動デプロイメント

#### Linux/macOS
```bash
# 実行権限付与
chmod +x scripts/terraform-deploy.sh

# 完全デプロイメント
./scripts/terraform-deploy.sh apply
```

#### Windows
```cmd
# 完全デプロイメント
scripts\terraform-deploy.bat apply
```

### 3. アクセス確認

デプロイ完了後、以下のURLでアクセス可能：
- **フロントエンド**: http://localhost:8080
- **API**: http://localhost:3000
- **API Health**: http://localhost:3000/health

## 📁 ファイル構成

```
terraform/
├── main.tf                 # メインのTerraform設定
├── variables.tf            # 変数定義
├── outputs.tf              # 出力定義
├── versions.tf             # プロバイダーバージョン制約
├── terraform.tfvars.example # 設定例
└── README.md               # Terraform固有のドキュメント

scripts/
├── terraform-deploy.sh     # Linux/macOS用デプロイスクリプト
└── terraform-deploy.bat    # Windows用デプロイスクリプト
```

## ⚙️ 詳細設定

### 設定ファイルのカスタマイズ

```bash
# 設定ファイルをコピー
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# 設定を編集
vim terraform/terraform.tfvars
```

#### 主要設定項目

```hcl
# 環境設定
environment = "production"
node_env    = "production"

# セキュリティ設定
postgres_password = "your-secure-password-here"
redis_password    = "your-redis-password-here"
jwt_secret        = "your-jwt-secret-key-change-in-production"

# リソース制限
postgres_memory_limit = "1g"
redis_memory_limit    = "256m"
api_memory_limit      = "1g"
frontend_memory_limit = "512m"

# ポート設定
postgres_external_port = 5432
redis_external_port    = 6379
api_external_port      = 3000
frontend_external_port = 8080
```

### 環境別設定

#### 開発環境
```hcl
environment = "development"
postgres_memory_limit = "256m"
redis_memory_limit = "64m"
api_memory_limit = "256m"
frontend_memory_limit = "128m"
```

#### 本番環境
```hcl
environment = "production"
postgres_memory_limit = "2g"
redis_memory_limit = "512m"
api_memory_limit = "2g"
frontend_memory_limit = "1g"
```

## 🔧 運用コマンド

### 基本操作

```bash
# 初期化（初回のみ）
./scripts/terraform-deploy.sh init

# 実行計画確認
./scripts/terraform-deploy.sh plan

# デプロイメント実行
./scripts/terraform-deploy.sh apply

# 状況確認
./scripts/terraform-deploy.sh status

# リソース削除
./scripts/terraform-deploy.sh destroy
```

### 個別操作

```bash
# Terraformディレクトリに移動
cd terraform

# 特定リソースのみ更新
terraform apply -target=podman_container.api

# 特定リソースのみ削除
terraform destroy -target=podman_container.frontend

# 設定検証
terraform validate

# フォーマット
terraform fmt
```

## 📊 監視とメンテナンス

### リソース監視

```bash
# コンテナ状況
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Size}}"

# リソース使用量
podman stats

# ネットワーク確認
podman network ls
podman network inspect master-data-maintenance-network

# ボリューム確認
podman volume ls
podman volume inspect master-data-maintenance-postgres-data
```

### ログ管理

```bash
# 全コンテナのログ
podman logs master-data-maintenance-api
podman logs master-data-maintenance-frontend
podman logs master-data-maintenance-db
podman logs master-data-maintenance-redis

# リアルタイムログ監視
podman logs -f master-data-maintenance-api

# ログのエクスポート
podman logs master-data-maintenance-api > api.log
```

### ヘルスチェック

```bash
# 自動ヘルスチェック
curl -f http://localhost:3000/health
curl -f http://localhost:8080

# データベース接続確認
podman exec -it master-data-maintenance-db psql -U admin -d master_data -c "SELECT version();"

# Redis接続確認
podman exec -it master-data-maintenance-redis redis-cli -a redis123 ping
```

## 🔄 更新とロールバック

### アプリケーション更新

```bash
# 1. 新しいイメージをビルド
podman build -t localhost/master-data-api:latest -f api/Dockerfile api/
podman build -t localhost/master-data-frontend:latest -f Dockerfile.frontend .

# 2. Terraformで更新適用
cd terraform
terraform apply -target=podman_container.api
terraform apply -target=podman_container.frontend
```

### 設定変更

```bash
# 1. terraform.tfvars を編集
vim terraform/terraform.tfvars

# 2. 変更内容確認
terraform plan

# 3. 変更適用
terraform apply
```

### ロールバック

```bash
# 1. 以前のイメージタグに戻す
podman tag localhost/master-data-api:previous localhost/master-data-api:latest

# 2. コンテナを再作成
terraform apply -target=podman_container.api

# 3. または完全なロールバック
terraform destroy
terraform apply
```

## 🔐 セキュリティ設定

### 機密情報管理

```bash
# 環境変数での設定
export TF_VAR_postgres_password="secure-password"
export TF_VAR_redis_password="secure-redis-password"
export TF_VAR_jwt_secret="secure-jwt-secret"

# Terraformで適用
terraform apply
```

### ネットワークセキュリティ

```hcl
# terraform/main.tf での設定例
resource "podman_network" "master_data_network" {
  name = "master-data-maintenance-network"
  
  # 内部ネットワークとして設定
  internal = true
  
  # 特定のサブネット指定
  subnet = "172.21.0.0/16"
}
```

### コンテナセキュリティ

```hcl
# 非rootユーザーでの実行
resource "podman_container" "api" {
  # ...
  user = "1001:1001"
  
  # セキュリティオプション
  security_opt = ["no-new-privileges:true"]
}
```

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. Terraform Provider エラー
```bash
# プロバイダーの再インストール
terraform init -upgrade

# キャッシュクリア
rm -rf .terraform
terraform init
```

#### 2. Podman接続エラー
```bash
# Podmanサービス確認
systemctl --user status podman.socket

# サービス再起動
systemctl --user restart podman.socket

# 接続テスト
podman system info
```

#### 3. ポート競合
```bash
# 使用中ポート確認
ss -tlnp | grep :8080

# terraform.tfvars でポート変更
frontend_external_port = 8081
```

#### 4. メモリ不足
```bash
# システムリソース確認
free -h
podman system df

# 不要なコンテナ・イメージ削除
podman system prune -a
```

#### 5. ボリューム権限エラー
```bash
# ボリューム権限確認
podman volume inspect master-data-maintenance-postgres-data

# 権限修正
sudo chown -R 999:999 /var/lib/containers/storage/volumes/master-data-maintenance-postgres-data
```

## 📈 パフォーマンス最適化

### リソース調整

```hcl
# 本番環境向け設定
postgres_memory_limit = "4g"
postgres_cpu_limit    = "2.0"
redis_memory_limit    = "1g"
redis_cpu_limit       = "1.0"
api_memory_limit      = "2g"
api_cpu_limit         = "1.5"
```

### ストレージ最適化

```bash
# ボリュームサイズ確認
podman volume inspect master-data-maintenance-postgres-data

# 不要データクリーンアップ
podman exec -it master-data-maintenance-db psql -U admin -d master_data -c "VACUUM FULL;"
```

## 🔗 関連ドキュメント

- [Terraform Podman Provider](https://registry.terraform.io/providers/containers/podman/latest/docs)
- [Podman Documentation](https://docs.podman.io/)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [Container Security Guide](https://docs.podman.io/en/latest/markdown/podman-run.1.html#security-options)

## 📞 サポート

問題が発生した場合：

1. **ログ確認**: `podman logs <container-name>`
2. **状況確認**: `./scripts/terraform-deploy.sh status`
3. **設定検証**: `terraform validate`
4. **リソース確認**: `terraform state list`

詳細なサポートが必要な場合は、プロジェクトのIssueトラッカーまでお問い合わせください。