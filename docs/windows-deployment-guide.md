# Windows環境でのOpenShift Sandboxデプロイガイド

## 📋 概要

Windows環境でOpenShift Sandboxにマスターデータメンテナンスシステムをデプロイする手順を説明します。

## 🛠️ 前提条件

### 1. 必要なツール

#### OpenShift CLI (oc)
```powershell
# Chocolateyを使用する場合
choco install openshift-cli

# または手動インストール
# https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-windows.zip
# をダウンロードして展開し、PATHに追加
```

#### Git for Windows
```powershell
# Chocolateyを使用する場合
choco install git

# または公式サイトからダウンロード
# https://git-scm.com/download/win
```

#### curl（ヘルスチェック用）
```powershell
# Windows 10/11には標準で含まれています
# 古いバージョンの場合はChocolateyでインストール
choco install curl
```

### 2. OpenShift Sandbox アカウント
- [Red Hat Developer Sandbox](https://developers.redhat.com/developer-sandbox) でアカウントを作成
- 無料で60日間利用可能

## 🚀 デプロイ手順

### Step 1: プロジェクトの準備

```cmd
# プロジェクトディレクトリに移動
cd master-data-maintenance

# スクリプトファイルの確認
dir scripts\*.bat
```

### Step 2: OpenShiftにログイン

```cmd
# OpenShift Sandboxのログインコマンドを実行
# （Webコンソールの右上「Copy login command」から取得）
oc login --token=sha256~xxxxx --server=https://api.sandbox-m2.ll9k.p1.openshiftapps.com:6443
```

### Step 3: GitHubリポジトリの設定

#### 自動設定（推奨）
```cmd
# GitHubリポジトリ設定ヘルパー実行
scripts\setup-github-repo.bat
```

#### 手動設定
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

### Step 4: GitHubにプッシュ

```cmd
# Gitリポジトリ初期化（まだの場合）
git init
git add .
git commit -m "Initial commit"

# GitHubリポジトリに接続
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

### Step 5: 自動デプロイ実行

```cmd
# 自動デプロイスクリプト実行
scripts\deploy-to-sandbox.bat
```

### Step 6: 手動デプロイ（代替方法）

```cmd
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

## 📊 監視とメンテナンス

### 状況確認

```cmd
# 全体監視
scripts\monitor-openshift.bat

# ビルド状況確認
scripts\build-status.bat

# 基本的な状況確認
oc get all
oc get pods
oc get builds
oc get routes
```

### ログ確認

```cmd
# ビルドログ確認
oc logs -f bc/master-data-api-build
oc logs -f bc/master-data-frontend-build

# アプリケーションログ確認
oc logs -f deployment/master-data-api
oc logs -f deployment/master-data-frontend
oc logs -f deployment/postgresql
oc logs -f deployment/redis
```

### アクセスURL確認

```cmd
# フロントエンドURL
oc get route master-data-frontend-route -o jsonpath="{.spec.host}"

# API URL
oc get route master-data-api-route -o jsonpath="{.spec.host}"
```

## 🔧 便利なバッチファイル

### 利用可能なスクリプト

| ファイル名 | 説明 |
|-----------|------|
| `deploy-to-sandbox.bat` | 自動デプロイメント |
| `monitor-openshift.bat` | リソース監視 |
| `build-status.bat` | ビルド状況確認 |
| `cleanup-openshift.bat` | リソースクリーンアップ |
| `setup-github-repo.bat` | GitHubリポジトリ設定 |

### 実行方法

```cmd
# コマンドプロンプトから実行
scripts\deploy-to-sandbox.bat

# またはエクスプローラーからダブルクリック
```

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. PowerShell実行ポリシーエラー

```powershell
# PowerShellを管理者として実行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. 文字化け問題

```cmd
# コマンドプロンプトの文字コード設定
chcp 65001
```

#### 3. oc コマンドが見つからない

```cmd
# PATHの確認
echo %PATH%

# OpenShift CLIの再インストール
choco install openshift-cli --force
```

#### 4. ビルドが失敗する場合

```cmd
# ビルドログ詳細確認
scripts\build-status.bat

# 手動でビルド再実行
oc start-build master-data-api-build
oc start-build master-data-frontend-build
```

## 🗑️ クリーンアップ

```cmd
# 全リソース削除
scripts\cleanup-openshift.bat

# または手動削除
oc delete all -l app=master-data-api
oc delete all -l app=master-data-frontend
oc delete all -l app=postgresql
oc delete all -l app=redis
oc delete configmap master-data-config postgres-init-scripts
oc delete secret master-data-secrets
```

## 📝 注意事項

### Windows固有の考慮事項

- **パス区切り文字**: バックスラッシュ（`\`）を使用
- **環境変数**: `%VARIABLE%` 形式
- **改行コード**: CRLF（`\r\n`）
- **文字エンコーディング**: UTF-8 BOM付きまたはShift_JIS

### バッチファイルの制限

- 複雑な文字列処理が困難
- エラーハンドリングが限定的
- 色付き出力が制限される
- 非同期処理が困難

### 代替手段

PowerShellスクリプトの使用も検討できます：

```powershell
# PowerShell版デプロイスクリプト例
.\scripts\deploy-to-sandbox.ps1
```

## 🔗 参考リンク

- [OpenShift CLI for Windows](https://docs.openshift.com/container-platform/4.12/cli_reference/openshift_cli/getting-started-cli.html#installing-openshift-cli-on-windows)
- [Git for Windows](https://git-scm.com/download/win)
- [Chocolatey Package Manager](https://chocolatey.org/)
- [Windows Command Line Reference](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands)