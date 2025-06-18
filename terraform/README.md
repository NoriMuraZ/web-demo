# Terraform Podman Infrastructure

このディレクトリには、Podmanを使用してマスターデータメンテナンスシステムをデプロイするためのTerraform設定が含まれています。

## 📋 概要

Terraformを使用してPodmanコンテナ環境を自動化し、Infrastructure as Code (IaC) として管理します。

### 🏗️ 構成要素

- **PostgreSQL**: データベースサーバー
- **Redis**: キャッシュ・セッション管理
- **API**: Node.js バックエンドサービス
- **Frontend**: React フロントエンドアプリケーション
- **Network**: 専用Podmanネットワーク
- **Volumes**: 永続化ストレージ

## 🚀 使用方法

### 前提条件

1. **Terraform** (>= 1.0) のインストール
2. **Podman** のインストールと設定
3. **Podman Terraform Provider** の利用可能性

### セットアップ手順

#### 1. 設定ファイルの準備

```bash
# terraform.tfvars ファイルを作成
cp terraform.tfvars.example terraform.tfvars

# 設定値を編集
vim terraform.tfvars
```

#### 2. Dockerイメージのビルド

```bash
# APIイメージのビルド
podman build -t localhost/master-data-api:latest -f api/Dockerfile api/

# フロントエンドイメージのビルド
podman build -t localhost/master-data-frontend:latest -f Dockerfile.frontend .
```

#### 3. Terraformの初期化

```bash
cd terraform
terraform init
```

#### 4. 設定の検証

```bash
# 設定の検証
terraform validate

# 実行計画の確認
terraform plan
```

#### 5. インフラストラクチャのデプロイ

```bash
# リソースの作成
terraform apply

# 確認プロンプトで 'yes' を入力
```

#### 6. デプロイ状況の確認

```bash
# 出力情報の表示
terraform output

# コンテナ状況の確認
podman ps

# ネットワーク確認
podman network ls

# ボリューム確認
podman volume ls
```

## 📊 リソース構成

### ネットワーク
- **名前**: `master-data-maintenance-network`
- **サブネット**: `172.21.0.0/16`
- **DNS**: 有効

### コンテナ

| サービス | コンテナ名 | ポート | メモリ | CPU |
|---------|-----------|--------|--------|-----|
| Redis | master-data-maintenance-redis | 6379 | 128MB | 0.2 |
| PostgreSQL | master-data-maintenance-db | 5432 | 512MB | 0.5 |
| API | master-data-maintenance-api | 3000 | 512MB | 0.5 |
| Frontend | master-data-maintenance-frontend | 8080 | 256MB | 0.3 |

### ボリューム
- **postgres-data**: PostgreSQLデータ永続化
- **redis-data**: Redisデータ永続化
- **api-logs**: APIログファイル

## 🔧 設定のカスタマイズ

### 環境変数

`terraform.tfvars` ファイルで以下の設定をカスタマイズできます：

```hcl
# 環境設定
environment = "production"

# データベース設定
postgres_password = "your-secure-password"
postgres_memory_limit = "1g"

# Redis設定
redis_password = "your-redis-password"

# API設定
jwt_secret = "your-jwt-secret"
api_memory_limit = "1g"

# ポート設定
postgres_external_port = 5432
redis_external_port = 6379
api_external_port = 3000
frontend_external_port = 8080
```

### リソース制限

各コンテナのリソース制限を調整：

```hcl
# メモリ制限
postgres_memory_limit = "1g"
redis_memory_limit = "256m"
api_memory_limit = "1g"
frontend_memory_limit = "512m"

# CPU制限
postgres_cpu_limit = "1.0"
redis_cpu_limit = "0.5"
api_cpu_limit = "1.0"
frontend_cpu_limit = "0.5"
```

## 🔍 監視とメンテナンス

### ヘルスチェック

各コンテナには自動ヘルスチェックが設定されています：

```bash
# コンテナヘルス状況確認
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 個別ヘルスチェック
curl http://localhost:3000/health  # API
curl http://localhost:8080         # Frontend
```

### ログ確認

```bash
# コンテナログの確認
podman logs master-data-maintenance-api
podman logs master-data-maintenance-frontend
podman logs master-data-maintenance-db
podman logs master-data-maintenance-redis

# リアルタイムログ監視
podman logs -f master-data-maintenance-api
```

### データベース接続

```bash
# PostgreSQL接続
podman exec -it master-data-maintenance-db psql -U admin -d master_data

# Redis接続
podman exec -it master-data-maintenance-redis redis-cli -a redis123
```

## 🔄 更新とロールバック

### アプリケーション更新

```bash
# 新しいイメージをビルド
podman build -t localhost/master-data-api:latest -f api/Dockerfile api/

# Terraformで更新適用
terraform apply
```

### 設定変更

```bash
# terraform.tfvars を編集
vim terraform.tfvars

# 変更を適用
terraform plan
terraform apply
```

### ロールバック

```bash
# 以前の状態に戻す
terraform apply -target=podman_container.api

# または完全なロールバック
terraform destroy
terraform apply
```

## 🗑️ クリーンアップ

### 全リソース削除

```bash
# Terraformリソースの削除
terraform destroy

# 確認プロンプトで 'yes' を入力
```

### 個別リソース削除

```bash
# 特定のコンテナのみ削除
terraform destroy -target=podman_container.frontend

# 特定のボリュームのみ削除
terraform destroy -target=podman_volume.postgres_data
```

## 🐛 トラブルシューティング

### よくある問題

#### 1. Podman Provider が見つからない

```bash
# Terraform初期化を再実行
terraform init -upgrade
```

#### 2. ポート競合

```bash
# 使用中のポートを確認
ss -tlnp | grep :8080

# terraform.tfvars でポートを変更
frontend_external_port = 8081
```

#### 3. イメージが見つからない

```bash
# イメージの存在確認
podman images | grep master-data

# イメージを再ビルド
podman build -t localhost/master-data-api:latest -f api/Dockerfile api/
```

#### 4. コンテナ起動失敗

```bash
# エラーログ確認
podman logs master-data-maintenance-api

# コンテナ詳細確認
podman inspect master-data-maintenance-api
```

## 📚 参考資料

- [Terraform Podman Provider](https://registry.terraform.io/providers/containers/podman/latest/docs)
- [Podman Documentation](https://docs.podman.io/)
- [Terraform Documentation](https://www.terraform.io/docs)

## 🔗 関連ファイル

- `../docker-compose.yml`: Docker Compose設定（参考）
- `../podman-compose.yml`: Podman Compose設定（参考）
- `../api/Dockerfile`: APIコンテナ設定
- `../Dockerfile.frontend`: フロントエンドコンテナ設定