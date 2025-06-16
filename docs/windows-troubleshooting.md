# Windows環境でのトラブルシューティングガイド

## 🐛 よくある問題と解決方法

### 1. バッチファイル実行エラー

#### 問題: 'e' は、内部コマンドまたは外部コマンド...として認識されていません

**原因**: PowerShellコマンドの構文エラーまたは文字エンコーディングの問題

**解決方法**:
```cmd
# 1. ファイルの文字エンコーディングを確認
# メモ帳で開いて「名前を付けて保存」→「エンコード」を「UTF-8」に設定

# 2. PowerShell実行ポリシーの確認
powershell -Command "Get-ExecutionPolicy"

# 3. 実行ポリシーの変更（必要に応じて）
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
```

#### 問題: バッチファイルが途中で停止する

**解決方法**:
```cmd
# エラーハンドリングを無視して続行
set "IGNORE_ERRORS=1"

# または個別にエラーを確認
echo %ERRORLEVEL%
```

### 2. OpenShift CLI関連

#### 問題: 'oc' は、内部コマンドまたは外部コマンド...として認識されていません

**解決方法**:
```cmd
# 1. OpenShift CLIがインストールされているか確認
where oc

# 2. PATHの確認
echo %PATH%

# 3. 再インストール
choco install openshift-cli --force

# 4. 手動インストールの場合
# https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-windows.zip
# をダウンロードして展開し、PATHに追加
```

#### 問題: oc login でエラーが発生する

**解決方法**:
```cmd
# 1. ネットワーク接続確認
ping api.sandbox-m2.ll9k.p1.openshiftapps.com

# 2. トークンの再取得
# OpenShift Webコンソールから「Copy login command」を再実行

# 3. プロキシ設定（企業環境の場合）
set HTTP_PROXY=http://proxy.company.com:8080
set HTTPS_PROXY=http://proxy.company.com:8080
```

### 3. Git関連

#### 問題: git コマンドが見つからない

**解決方法**:
```cmd
# 1. Gitがインストールされているか確認
git --version

# 2. インストール
choco install git

# 3. 手動インストール
# https://git-scm.com/download/win からダウンロード
```

#### 問題: GitHubへのプッシュでエラー

**解決方法**:
```cmd
# 1. 認証情報の確認
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Personal Access Tokenの使用
# GitHubでPersonal Access Tokenを生成し、パスワードの代わりに使用

# 3. SSH鍵の設定
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"
```

### 4. 文字化け問題

#### 問題: 日本語が文字化けする

**解決方法**:
```cmd
# 1. コードページをUTF-8に変更
chcp 65001

# 2. フォントの変更
# コマンドプロンプトのプロパティ→フォント→「MS ゴシック」または「Consolas」

# 3. 環境変数の設定
set LANG=ja_JP.UTF-8
```

### 5. PowerShell関連

#### 問題: PowerShell実行ポリシーエラー

**解決方法**:
```powershell
# 1. 現在のポリシー確認
Get-ExecutionPolicy

# 2. ポリシー変更（管理者権限不要）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. 一時的な実行許可
powershell -ExecutionPolicy Bypass -File script.ps1
```

### 6. ネットワーク関連

#### 問題: curl コマンドでSSLエラー

**解決方法**:
```cmd
# 1. SSL証明書の検証をスキップ（テスト用のみ）
curl -k https://example.com

# 2. 証明書ストアの更新
certlm.msc

# 3. プロキシ設定
curl --proxy http://proxy.company.com:8080 https://example.com
```

### 7. ファイルパス関連

#### 問題: パスが見つからない

**解決方法**:
```cmd
# 1. 相対パスの確認
cd /d "%~dp0"

# 2. 絶対パスの使用
set "SCRIPT_DIR=%~dp0"
echo %SCRIPT_DIR%

# 3. パス区切り文字の統一
set "FILE_PATH=%CD%\openshift-sandbox\configmap.yaml"
```

## 🔧 デバッグ方法

### バッチファイルのデバッグ

```cmd
# 1. エコーを有効にしてデバッグ
@echo on

# 2. 変数の値を確認
echo DEBUG: current_project=%current_project%

# 3. 一時停止してデバッグ
pause

# 4. ログファイルに出力
command > debug.log 2>&1
```

### PowerShellコマンドのデバッグ

```cmd
# 1. PowerShellコマンドを直接実行
powershell -Command "Get-Content 'test.txt'"

# 2. エラー詳細の表示
powershell -Command "try { Get-Content 'test.txt' } catch { Write-Error $_.Exception.Message }"
```

## 📝 予防策

### 1. 環境の事前確認

```cmd
# 必要なツールの確認スクリプト
@echo off
echo 環境確認中...

where oc >nul 2>&1
if errorlevel 1 (
    echo [ERROR] OpenShift CLI が見つかりません
) else (
    echo [OK] OpenShift CLI
)

where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git が見つかりません
) else (
    echo [OK] Git
)

where curl >nul 2>&1
if errorlevel 1 (
    echo [ERROR] curl が見つかりません
) else (
    echo [OK] curl
)
```

### 2. 設定ファイルのバックアップ

```cmd
# 重要な設定ファイルをバックアップ
copy openshift-sandbox\*.yaml backup\
```

### 3. ログの保存

```cmd
# 実行ログを保存
scripts\deploy-to-sandbox.bat > deploy.log 2>&1
```

## 🔗 参考リンク

- [Windows Command Line Reference](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [OpenShift CLI for Windows](https://docs.openshift.com/container-platform/4.12/cli_reference/openshift_cli/getting-started-cli.html#installing-openshift-cli-on-windows)
- [Git for Windows](https://git-scm.com/download/win)