# Windows環境でのセットアップガイド

## 🚀 クイックスタート（Windows）

### 1. 前提条件のインストール

```cmd
# Chocolateyがインストールされている場合
choco install openshift-cli git curl

# または手動でインストール
# - OpenShift CLI: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-windows.zip
# - Git: https://git-scm.com/download/win
```

### 2. OpenShift Sandboxにログイン

```cmd
# OpenShift Sandboxからログインコマンドをコピーして実行
oc login --token=your-token --server=your-server
```

### 3. GitHubリポジトリの設定

```cmd
# 自動設定ツールを実行
scripts\setup-github-repo.bat

# プロジェクトをGitHubにプッシュ
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 4. デプロイメント実行

```cmd
# 自動デプロイスクリプト実行
scripts\deploy-to-sandbox.bat
```

### 5. 状況確認

```cmd
# リソース監視
scripts\monitor-openshift.bat

# ビルド状況確認
scripts\build-status.bat
```

## 📁 Windows用スクリプト一覧

| ファイル | 説明 |
|---------|------|
| `scripts\deploy-to-sandbox.bat` | 自動デプロイメント |
| `scripts\monitor-openshift.bat` | リソース監視 |
| `scripts\build-status.bat` | ビルド状況確認 |
| `scripts\cleanup-openshift.bat` | リソースクリーンアップ |
| `scripts\setup-github-repo.bat` | GitHubリポジトリ設定 |

## 🔧 手動操作コマンド

```cmd
# 基本的な状況確認
oc get all
oc get pods
oc get builds
oc get routes

# ログ確認
oc logs -f deployment/master-data-api
oc logs -f bc/master-data-api-build

# アクセスURL確認
oc get route master-data-frontend-route -o jsonpath="{.spec.host}"
```

## 🐛 トラブルシューティング

### PowerShell実行ポリシーエラー
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 文字化け対策
```cmd
chcp 65001
```

### oc コマンドが見つからない
```cmd
# PATHの確認
echo %PATH%

# 再インストール
choco install openshift-cli --force
```

## 📖 詳細ガイド

詳細な手順については以下を参照してください：
- [docs/windows-deployment-guide.md](docs/windows-deployment-guide.md)
- [docs/openshift-sandbox-quickstart.md](docs/openshift-sandbox-quickstart.md)

## 🌐 アクセス

デプロイ完了後、以下のようなURLでアクセス可能：
- フロントエンド: `https://master-data-frontend-route-{project}.apps.sandbox-m2.ll9k.p1.openshiftapps.com`
- API: `https://master-data-api-route-{project}.apps.sandbox-m2.ll9k.p1.openshiftapps.com`