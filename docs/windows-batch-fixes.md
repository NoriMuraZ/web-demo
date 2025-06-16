# Windows バッチファイル修正ガイド

## 🔧 修正された問題

### 1. 文字エンコーディング問題

**問題**: 日本語文字が文字化けして、コマンドとして認識される
```
'函縺励∪縺励◆' は、内部コマンドまたは外部コマンド...
```

**解決策**:
```cmd
@echo off
chcp 65001 >nul  # UTF-8に設定
setlocal enabledelayedexpansion  # 遅延展開を有効化
```

### 2. 変数展開問題

**問題**: 変数が正しく展開されない
```
'urrent_project' は、内部コマンドまたは外部コマンド...
```

**解決策**:
```cmd
# 遅延展開を使用
setlocal enabledelayedexpansion
echo !current_project!  # %current_project% ではなく !current_project!
```

### 3. PowerShellコマンド実行問題

**問題**: PowerShellコマンドの構文エラー

**解決策**:
```cmd
# エンコーディングを明示的に指定
powershell -Command "$content = Get-Content 'file.yaml' -Raw -Encoding UTF8; $content = $content -replace 'old', 'new'; Set-Content 'file.yaml' -Value $content -NoNewline -Encoding UTF8"
```

### 4. エラーハンドリング改善

**修正前**:
```cmd
command
if errorlevel 1 echo エラーが発生しました
```

**修正後**:
```cmd
command
if errorlevel 1 echo !ERROR_PREFIX! エラーが発生しました
```

## 📁 修正されたファイル

| ファイル | 主な修正内容 |
|---------|-------------|
| `deploy-to-sandbox.bat` | 文字エンコーディング、変数展開、エラーハンドリング |
| `monitor-openshift.bat` | 変数展開、URL取得処理 |
| `build-status.bat` | ビルド情報取得処理 |
| `cleanup-openshift.bat` | 確認プロンプト、リソース削除処理 |
| `setup-github-repo.bat` | PowerShellコマンド、ファイル更新処理 |

## 🚀 使用方法

### 1. 基本的な実行

```cmd
# プロジェクトディレクトリに移動
cd master-data-maintenance

# デプロイメント実行
scripts\deploy-to-sandbox.bat
```

### 2. GitHubリポジトリ設定

```cmd
# 自動設定
scripts\setup-github-repo.bat

# 手動確認
type openshift-sandbox\api-buildconfig.yaml | findstr github.com
```

### 3. 監視とメンテナンス

```cmd
# リソース監視
scripts\monitor-openshift.bat

# ビルド状況確認
scripts\build-status.bat

# クリーンアップ
scripts\cleanup-openshift.bat
```

## 🐛 トラブルシューティング

### 文字化けが発生する場合

```cmd
# コマンドプロンプトの設定確認
chcp

# UTF-8に設定
chcp 65001

# フォント設定
# コマンドプロンプトのプロパティ → フォント → 「MS ゴシック」
```

### PowerShell実行エラー

```cmd
# 実行ポリシー確認
powershell -Command "Get-ExecutionPolicy"

# 実行ポリシー変更
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
```

### 変数が展開されない場合

```cmd
# 遅延展開が有効か確認
setlocal enabledelayedexpansion
set "test=hello"
echo !test!  # %test% ではなく !test! を使用
```

## 📝 重要な注意事項

### 1. 文字エンコーディング

- 全てのバッチファイルはUTF-8で保存
- `chcp 65001` でUTF-8に設定
- PowerShellコマンドでは `-Encoding UTF8` を指定

### 2. 変数展開

- `setlocal enabledelayedexpansion` を使用
- 変数参照は `!variable!` 形式
- ループ内での変数更新に必須

### 3. エラーハンドリング

- `errorlevel` でコマンドの成功/失敗を確認
- 重要なコマンドには必ずエラーチェックを追加
- ユーザーフレンドリーなエラーメッセージ

### 4. パス処理

- バックスラッシュ（`\`）を使用
- 相対パスと絶対パスの使い分け
- スペースを含むパスは引用符で囲む

## 🔗 参考情報

- [Windows Command Line Reference](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/)
- [Batch File Programming](https://www.tutorialspoint.com/batch_script/)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)