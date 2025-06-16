# OpenShift Sandbox デプロイメントガイド

## 📋 概要

このガイドでは、Red Hat OpenShift Sandboxにマスターデータメンテナンスシステムをデプロイする手順を説明します。

## 🚀 前提条件

### 1. OpenShift Sandbox アカウント
- [Red Hat Developer Sandbox](https://developers.redhat.com/developer-sandbox) でアカウントを作成
- 無料で60日間利用可能

### 2. 必要なツール
```bash
# OpenShift CLI のインストール
curl -LO https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-linux.tar.gz
tar -xzf openshift-client-linux.tar.gz
sudo mv oc /usr/local/bin/
```

### 3. GitHubリポジトリ
- プロジェクトをGitHubにプッシュしておく
- BuildConfigでソースコードを参照するため

## 🔧 デプロイ手順

### Step 1: OpenShiftにログイン

```bash
# OpenShift Sandboxのログインコマンドを実行
# （Webコンソールの右上「Copy login command」から取得）
oc login --token=sha256~xxxxx --server=https://api.sandbox-m2.ll9k.p1.openshiftapps.com:6443
```

### Step 2: プロジェクト作成とリソースデプロイ

```bash
# プロジェクトディレクトリに移動
cd master-data-maintenance

# 全リソースを一括デプロイ
oc apply -k openshift/

# または個別にデプロイ
oc apply -f openshift/namespace.yaml
oc apply -f openshift/configmap.yaml
oc apply -f openshift/secrets.yaml
oc apply -f openshift/postgres-init-configmap.yaml
oc apply -f openshift/redis-deployment.yaml
oc apply -f openshift/postgresql-deployment.yaml
oc apply -f openshift/api-buildconfig.yaml
oc apply -f openshift/frontend-buildconfig.yaml
oc apply -f openshift/api-deployment.yaml
oc apply -f openshift/frontend-deployment.yaml
```

### Step 3: ビルドの開始

```bash
# APIのビルド開始
oc start-build master-data-api-build -n master-data-maintenance

# フロントエンドのビルド開始
oc start-build master-data-frontend-build -n master-data-maintenance
```

### Step 4: デプロイ状況の確認

```bash
# ビルド状況確認
oc get builds -n master-data-maintenance

# Pod状況確認
oc get pods -n master-data-maintenance

# サービス確認
oc get svc -n master-data-maintenance

# ルート確認（外部アクセスURL）
oc get routes -n master-data-maintenance
```

### Step 5: ログ確認

```bash
# APIのログ確認
oc logs -f deployment/master-data-api -n master-data-maintenance

# データベースのログ確認
oc logs -f deployment/postgresql -n master-data-maintenance

# Redisのログ確認
oc logs -f deployment/redis -n master-data-maintenance
```

## 🌐 アクセス方法

デプロイ完了後、以下のURLでアクセス可能：

```bash
# フロントエンドURL取得
oc get route master-data-frontend-route -n master-data-maintenance -o jsonpath='{.spec.host}'

# APIURL取得
oc get route master-data-api-route -n master-data-maintenance -o jsonpath='{.spec.host}'
```

通常は以下のような形式になります：
- フロントエンド: `https://master-data-frontend-route-master-data-maintenance.apps.sandbox-m2.ll9k.p1.openshiftapps.com`
- API: `https://master-data-api-route-master-data-maintenance.apps.sandbox-m2.ll9k.p1.openshiftapps.com`

## 🔧 設定のカスタマイズ

### 環境変数の変更

```bash
# ConfigMapの編集
oc edit configmap master-data-config -n master-data-maintenance

# Secretの編集
oc edit secret master-data-secrets -n master-data-maintenance
```

### リソース制限の調整

```bash
# APIのリソース制限変更
oc patch deployment master-data-api -n master-data-maintenance -p '{"spec":{"template":{"spec":{"containers":[{"name":"master-data-api","resources":{"limits":{"memory":"1Gi","cpu":"500m"}}}]}}}}'
```

### スケーリング

```bash
# レプリカ数の変更
oc scale deployment master-data-api --replicas=2 -n master-data-maintenance
oc scale deployment master-data-frontend --replicas=2 -n master-data-maintenance
```

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドが失敗する場合

```bash
# ビルドログの確認
oc logs -f bc/master-data-api-build -n master-data-maintenance

# 一般的な原因：
# - GitHubリポジトリのアクセス権限
# - Dockerfileの構文エラー
# - 依存関係の問題
```

#### 2. Podが起動しない場合

```bash
# Pod詳細確認
oc describe pod <pod-name> -n master-data-maintenance

# 一般的な原因：
# - リソース不足
# - イメージプル失敗
# - 環境変数の設定ミス
```

#### 3. データベース接続エラー

```bash
# PostgreSQL Pod確認
oc exec -it deployment/postgresql -n master-data-maintenance -- psql -U admin -d master_data -c "\dt"

# 接続テスト
oc exec -it deployment/master-data-api -n master-data-maintenance -- curl http://localhost:3000/health
```

#### 4. Redis接続エラー

```bash
# Redis接続確認
oc exec -it deployment/redis -n master-data-maintenance -- redis-cli -a redis123 ping
```

## 📊 監視とメンテナンス

### リソース使用量確認

```bash
# CPU・メモリ使用量
oc adm top pods -n master-data-maintenance

# ストレージ使用量
oc get pvc -n master-data-maintenance
```

### ログ管理

```bash
# 全Podのログ確認
oc logs -l app=master-data-api -n master-data-maintenance --tail=100

# ログのエクスポート
oc logs deployment/master-data-api -n master-data-maintenance > api.log
```

## 🔄 更新とロールバック

### アプリケーション更新

```bash
# 新しいビルドの開始
oc start-build master-data-api-build -n master-data-maintenance

# デプロイメントの更新
oc rollout restart deployment/master-data-api -n master-data-maintenance
```

### ロールバック

```bash
# デプロイ履歴確認
oc rollout history deployment/master-data-api -n master-data-maintenance

# 前のバージョンにロールバック
oc rollout undo deployment/master-data-api -n master-data-maintenance
```

## 🗑️ クリーンアップ

```bash
# 全リソース削除
oc delete namespace master-data-maintenance

# または個別削除
oc delete -k openshift/
```

## 📝 注意事項

### OpenShift Sandboxの制限

- **リソース制限**: CPU 7コア、メモリ15GB、ストレージ40GB
- **期間制限**: 60日間（延長可能）
- **ネットワーク**: 外部からのアクセスはRouteのみ
- **永続化**: emptyDirを使用（Pod再起動でデータ消失）

### 本番環境への移行時の考慮事項

- 永続ボリュームの設定
- データベースのバックアップ戦略
- SSL証明書の設定
- 監視・アラートの設定
- セキュリティポリシーの適用

## 🔗 参考リンク

- [OpenShift Sandbox](https://developers.redhat.com/developer-sandbox)
- [OpenShift Documentation](https://docs.openshift.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)