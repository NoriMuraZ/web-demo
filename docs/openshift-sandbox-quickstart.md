# OpenShift Sandbox クイックスタートガイド

## 🚨 重要な修正点

OpenShift Sandboxでは、ユーザーが独自の名前空間（Namespace）を作成できません。既存のプロジェクト内でリソースを作成する必要があります。

## 🚀 修正版デプロイ手順

### Step 1: OpenShiftにログイン

```bash
# OpenShift Sandboxのログインコマンドを実行
oc login --token=<your-token> --server=<your-server>
```

### Step 2: 現在のプロジェクト確認

```bash
# 現在のプロジェクト確認
oc project

# 利用可能なプロジェクト一覧
oc projects
```

### Step 3: GitHubリポジトリの設定

以下のファイルを編集して、実際のGitHubリポジトリURLに変更：

**openshift-sandbox/api-buildconfig.yaml**
```yaml
spec:
  source:
    type: Git
    git:
      uri: https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git  # ← 変更
      ref: main
```

**openshift-sandbox/frontend-buildconfig.yaml**
```yaml
spec:
  source:
    type: Git
    git:
      uri: https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git  # ← 変更
      ref: main
```

### Step 4: 自動デプロイ実行

```bash
# 実行権限付与
chmod +x scripts/deploy-to-sandbox.sh

# 自動デプロイ実行
./scripts/deploy-to-sandbox.sh
```

### Step 5: 手動デプロイ（代替方法）

```bash
# 設定ファイルのデプロイ
oc apply -f openshift-sandbox/configmap.yaml
oc apply -f openshift-sandbox/secrets.yaml
oc apply -f openshift-sandbox/postgres-init-configmap.yaml

# データベースのデプロイ
oc apply -f openshift-sandbox/redis-deployment.yaml
oc apply -f openshift-sandbox/postgresql-deployment.yaml

# ビルド設定のデプロイ
oc apply -f openshift-sandbox/api-buildconfig.yaml
oc apply -f openshift-sandbox/frontend-buildconfig.yaml

# ビルド開始
oc start-build master-data-api-build
oc start-build master-data-frontend-build

# アプリケーションのデプロイ
oc apply -f openshift-sandbox/api-deployment.yaml
oc apply -f openshift-sandbox/frontend-deployment.yaml
```

## 📊 状況確認コマンド

```bash
# 全体状況確認
oc get all

# Pod状況確認
oc get pods

# ビルド状況確認
oc get builds

# サービス確認
oc get svc

# ルート確認（外部アクセスURL）
oc get routes
```

## 🔍 ログ確認

```bash
# ビルドログ確認
oc logs -f bc/master-data-api-build
oc logs -f bc/master-data-frontend-build

# アプリケーションログ確認
oc logs -f deployment/master-data-api
oc logs -f deployment/master-data-frontend
oc logs -f deployment/postgresql
oc logs -f deployment/redis
```

## 🌐 アクセス方法

```bash
# アクセスURL取得
echo "フロントエンド: https://$(oc get route master-data-frontend-route -o jsonpath='{.spec.host}')"
echo "API: https://$(oc get route master-data-api-route -o jsonpath='{.spec.host}')"
```

## 🐛 トラブルシューティング

### 1. ビルドが失敗する場合

```bash
# ビルドログ確認
oc logs -f bc/master-data-api-build

# 一般的な原因：
# - GitHubリポジトリのアクセス権限
# - Dockerfileの構文エラー
# - 依存関係の問題
```

### 2. Pod が起動しない場合

```bash
# Pod詳細確認
oc describe pod <pod-name>

# 一般的な原因：
# - リソース不足
# - イメージプル失敗
# - 環境変数の設定ミス
```

### 3. データベース接続エラー

```bash
# PostgreSQL接続確認
oc exec -it deployment/postgresql -- psql -U admin -d master_data -c "\dt"

# Redis接続確認
oc exec -it deployment/redis -- redis-cli -a redis123 ping
```

## 🗑️ クリーンアップ

```bash
# 個別リソース削除
oc delete all -l app=master-data-api
oc delete all -l app=master-data-frontend
oc delete all -l app=postgresql
oc delete all -l app=redis

# ConfigMapとSecret削除
oc delete configmap master-data-config postgres-init-scripts
oc delete secret master-data-secrets
```

## 📝 重要な注意事項

### OpenShift Sandboxの制限

- **名前空間**: 独自の名前空間作成不可
- **リソース制限**: CPU 7コア、メモリ15GB
- **期間制限**: 60日間（延長可能）
- **永続化**: emptyDirのみ（Pod再起動でデータ消失）

### セキュリティ設定

- 全コンテナで非rootユーザー実行
- セキュリティコンテキストの適切な設定
- 不要な権限の削除

## 🔗 次のステップ

1. ビルド完了の確認
2. アプリケーションの動作確認
3. データベースの初期化確認
4. 外部アクセスの確認