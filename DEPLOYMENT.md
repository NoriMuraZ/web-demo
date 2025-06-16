# OpenShift デプロイメントガイド

## 前提条件

- OpenShift CLI (oc) がインストールされていること
- OpenShiftクラスターへのアクセス権限があること
- Dockerまたはpodmanがインストールされていること（ローカルビルドの場合）

## デプロイ手順

### 1. OpenShiftにログイン

```bash
oc login <your-openshift-cluster-url>
```

### 2. プロジェクト作成

```bash
oc new-project master-data-maintenance
```

### 3. アプリケーションのデプロイ

#### 方法A: Source-to-Image (S2I) を使用

```bash
# GitHubリポジトリから直接デプロイ
oc new-app nodejs~https://github.com/your-username/master-data-maintenance.git

# ルートを作成してアプリケーションを公開
oc expose svc/master-data-maintenance
```

#### 方法B: Dockerfileを使用

```bash
# BuildConfigとImageStreamを作成
oc apply -f openshift/buildconfig.yaml

# ビルドを開始
oc start-build master-data-maintenance-build

# デプロイメントとサービスを作成
oc apply -f openshift/deployment.yaml
```

#### 方法C: ローカルでビルドしてプッシュ

```bash
# ローカルでイメージをビルド
docker build -t master-data-maintenance:latest .

# OpenShiftの内部レジストリにタグ付け
docker tag master-data-maintenance:latest default-route-openshift-image-registry.apps.<cluster-domain>/master-data-maintenance/master-data-maintenance:latest

# イメージをプッシュ
docker push default-route-openshift-image-registry.apps.<cluster-domain>/master-data-maintenance/master-data-maintenance:latest

# デプロイメントを作成
oc apply -f openshift/deployment.yaml
```

### 4. デプロイメント状況の確認

```bash
# Pod の状態を確認
oc get pods

# サービスの状態を確認
oc get svc

# ルートの確認
oc get routes

# ログの確認
oc logs -f deployment/master-data-maintenance
```

### 5. アプリケーションへのアクセス

```bash
# アプリケーションのURLを取得
oc get route master-data-maintenance-route -o jsonpath='{.spec.host}'
```

## 設定のカスタマイズ

### 環境変数の設定

```bash
# ConfigMapを作成
oc create configmap app-config --from-literal=NODE_ENV=production

# Secretを作成（機密情報用）
oc create secret generic app-secrets --from-literal=API_KEY=your-api-key

# デプロイメントに環境変数を追加
oc set env deployment/master-data-maintenance --from=configmap/app-config
oc set env deployment/master-data-maintenance --from=secret/app-secrets
```

### リソース制限の調整

```bash
# CPU・メモリ制限を設定
oc set resources deployment/master-data-maintenance --requests=cpu=100m,memory=128Mi --limits=cpu=200m,memory=256Mi
```

### オートスケーリングの設定

```bash
# Horizontal Pod Autoscaler を作成
oc autoscale deployment/master-data-maintenance --min=2 --max=10 --cpu-percent=70
```

## トラブルシューティング

### よくある問題と解決方法

1. **ビルドが失敗する場合**
   ```bash
   oc logs -f bc/master-data-maintenance-build
   ```

2. **Podが起動しない場合**
   ```bash
   oc describe pod <pod-name>
   oc logs <pod-name>
   ```

3. **ルートにアクセスできない場合**
   ```bash
   oc get routes
   oc describe route master-data-maintenance-route
   ```

## セキュリティ考慮事項

- HTTPS通信の強制（TLS termination）
- セキュリティヘッダーの設定
- 最小権限の原則に基づくRBAC設定
- 機密情報はSecretリソースで管理

## 監視とログ

- OpenShiftの標準監視機能を活用
- ログはOpenShiftのログ集約機能で管理
- アラート設定の検討

## バックアップとリストア

- 設定ファイルのバージョン管理
- データベース（将来的に追加される場合）のバックアップ戦略