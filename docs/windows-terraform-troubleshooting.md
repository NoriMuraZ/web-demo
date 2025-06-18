# Windows環境でのTerraform Podmanトラブルシューティングガイド

## 🐛 よくある問題と解決方法

### 1. バッチファイル実行エラー

#### 問題: 文字化けエラー
```
'繝・繝ｭ繧､繝｡繝ｳ繝・' は、内部コマンドまたは外部コマンド...として認識されていません。
```

**解決方法**:
```cmd
# 1. コマンドプロンプトの文字コードをUTF-8に設定
chcp 65001

# 2. バッチファイルがUTF-8 BOM付きで保存されていることを確認
# メモ帳で開いて「名前を付けて保存」→「エンコード」を「UTF-8」に設定

# 3. 遅延展開を有効にして変数を正しく参照
setlocal enabledelayedexpansion
echo !variable_name!  # %variable_name% ではなく !variable_name!
```

#### 問題: 変数展開エラー
```
'urrent_project' は、内部コマンドまたは外部コマンド...として認識されていません。
```

**解決方法**:
```cmd
# 遅延展開の使用
setlocal enabledelayedexpansion
set "current_project=test"
echo !current_project!  # 正しい
echo %current_project%  # エラーの原因
```

### 2. Terraform関連エラー

#### 問題: Terraform が見つからない
```
'terraform' は、内部コマンドまたは外部コマンド...として認識されていません。
```

**解決方法**:
```cmd
# 1. Terraformがインストールされているか確認
where terraform

# 2. PATHの確認
echo %PATH%

# 3. Chocolateyでインストール
choco install terraform

# 4. 手動インストール
# https://www.terraform.io/downloads からダウンロード
# C:\terraform\ に展開してPATHに追加
```

#### 問題: Podman Provider エラー
```
Error: Failed to query available provider packages
```

**解決方法**:
```cmd
# 1. Terraform初期化を再実行
cd terraform
terraform init -upgrade

# 2. プロバイダーキャッシュをクリア
rmdir /s .terraform
terraform init

# 3. プロキシ設定（企業環境の場合）
set HTTP_PROXY=http://proxy.company.com:8080
set HTTPS_PROXY=http://proxy.company.com:8080
terraform init
```

### 3. Podman関連エラー

#### 問題: Podman が見つからない
```
'podman' は、内部コマンドまたは外部コマンド...として認識されていません。
```

**解決方法**:
```cmd
# 1. Podman Desktopのインストール確認
# https://podman-desktop.io/downloads からダウンロード

# 2. Podman CLIのPATH確認
where podman

# 3. Podman Desktopの起動確認
# タスクトレイにPodmanアイコンがあることを確認

# 4. Podman サービス確認
podman system info
```

#### 問題: Podman接続エラー
```
Error: unable to connect to Podman socket
```

**解決方法**:
```cmd
# 1. Podman Desktopの再起動
# タスクマネージャーでPodman Desktopを終了して再起動

# 2. Podman マシンの確認
podman machine list
podman machine start

# 3. WSL2の確認（Windows）
wsl --list --verbose
wsl --set-default-version 2
```

### 4. ネットワーク関連エラー

#### 問題: ポート競合エラー
```
Error: port 8080 is already in use
```

**解決方法**:
```cmd
# 1. 使用中のポートを確認
netstat -ano | findstr :8080

# 2. プロセスを終了
taskkill /PID <PID番号> /F

# 3. terraform.tfvars でポートを変更
frontend_external_port = 8081
api_external_port = 3001
```

#### 問題: DNS解決エラー
```
Error: failed to resolve network
```

**解決方法**:
```cmd
# 1. Podmanネットワークの確認
podman network ls

# 2. 既存ネットワークの削除
podman network rm master-data-maintenance-network

# 3. Terraformで再作成
terraform apply
```

### 5. ファイルパス関連エラー

#### 問題: パスが見つからない
```
Error: file not found
```

**解決方法**:
```cmd
# 1. 絶対パスの使用
set "TERRAFORM_DIR=%~dp0terraform"
cd /d "%TERRAFORM_DIR%"

# 2. パス区切り文字の統一
set "FILE_PATH=%CD%\terraform\main.tf"

# 3. スペースを含むパスの処理
set "PROJECT_PATH=%USERPROFILE%\Documents\My Project"
cd /d "%PROJECT_PATH%"
```

### 6. 権限関連エラー

#### 問題: アクセス拒否エラー
```
Error: Access denied
```

**解決方法**:
```cmd
# 1. 管理者権限でコマンドプロンプトを実行
# スタートメニュー → cmd → 右クリック → 管理者として実行

# 2. ファイル権限の確認
icacls terraform\terraform.tfvars

# 3. 権限の修正
icacls terraform\terraform.tfvars /grant %USERNAME%:F
```

### 7. メモリ・リソース関連エラー

#### 問題: メモリ不足エラー
```
Error: insufficient memory
```

**解決方法**:
```cmd
# 1. システムリソースの確認
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory

# 2. terraform.tfvars でメモリ制限を調整
postgres_memory_limit = "256m"
redis_memory_limit = "64m"
api_memory_limit = "256m"
frontend_memory_limit = "128m"

# 3. 不要なコンテナの削除
podman system prune -a
```

## 🔧 デバッグ方法

### バッチファイルのデバッグ

```cmd
# 1. エコーを有効にしてデバッグ
@echo on

# 2. 変数の値を確認
echo DEBUG: TERRAFORM_DIR=!TERRAFORM_DIR!
echo DEBUG: ACTION=!ACTION!

# 3. 一時停止してデバッグ
pause

# 4. ログファイルに出力
scripts\terraform-deploy.bat apply > deploy.log 2>&1
```

### Terraformのデバッグ

```cmd
# 1. 詳細ログの有効化
set TF_LOG=DEBUG
terraform apply

# 2. 特定プロバイダーのログ
set TF_LOG_PROVIDER=DEBUG
terraform apply

# 3. ログファイルへの出力
set TF_LOG_PATH=terraform.log
terraform apply
```

### Podmanのデバッグ

```cmd
# 1. 詳細ログの有効化
podman --log-level=debug ps

# 2. コンテナの詳細情報
podman inspect master-data-maintenance-api

# 3. ネットワーク詳細情報
podman network inspect master-data-maintenance-network
```

## 📝 予防策

### 1. 環境の事前確認

```cmd
# 環境確認スクリプト
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 環境確認中...

REM Terraform確認
terraform version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Terraform が見つかりません
) else (
    echo [OK] Terraform
)

REM Podman確認
podman version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Podman が見つかりません
) else (
    echo [OK] Podman
)

REM curl確認
curl --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] curl が見つかりません
) else (
    echo [OK] curl
)

pause
```

### 2. 設定ファイルのバックアップ

```cmd
# 重要な設定ファイルをバックアップ
if not exist backup mkdir backup
copy terraform\terraform.tfvars backup\terraform.tfvars.%date:~0,4%%date:~5,2%%date:~8,2%
```

### 3. ログの保存

```cmd
# 実行ログを保存
scripts\terraform-deploy.bat apply > logs\deploy_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%.log 2>&1
```

## 🔗 参考リンク

- [Windows Command Line Reference](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/)
- [Terraform Windows Installation](https://learn.hashicorp.com/tutorials/terraform/install-cli#install-terraform)
- [Podman Desktop for Windows](https://podman-desktop.io/docs/Installation/windows-install)
- [Windows Subsystem for Linux (WSL2)](https://docs.microsoft.com/en-us/windows/wsl/install)

## 📞 サポート

問題が解決しない場合：

1. **ログファイルの確認**: `deploy.log` や `terraform.log`
2. **環境情報の収集**: `systeminfo` コマンドの実行
3. **エラーメッセージの詳細**: 完全なエラーメッセージをコピー
4. **再現手順**: 問題が発生する具体的な手順

これらの情報を含めてプロジェクトのIssueトラッカーまでお問い合わせください。