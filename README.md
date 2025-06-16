# サンプルアプリ

<div align="center">

![Master Data Maintenance System](https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop)

**企業向け統合マスターデータ管理プラットフォーム**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![OpenShift](https://img.shields.io/badge/OpenShift-Compatible-red.svg)](https://www.openshift.com/)

</div>

## 📋 サンプルアプリ概要

このアプリケーションは以下目的で作られています。
* Web3層アプリケーションの学習
* 学習シリーズ「いまからでも遅くない！」内の「Webアプリでコンテナを学ぼう」のためのアプリ
* 最終的にはコンテナオーケストレーションでのDeployができるところまでを目指す

### 🎯 主要な特徴

- **🔐 高度なロールベースアクセス制御（RBAC）**
- **📊 リアルタイムダッシュボード**
- **🔍 高速検索・フィルタリング機能**
- **📱 レスポンシブデザイン**
- **🚀 マイクロサービスアーキテクチャ**
- **🐳 コンテナ対応**
- **☁️ クラウドネイティブ**

## 🏗️ システムアーキテクチャ

### Web3層アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    プレゼンテーション層                        │
│  React + TypeScript + Tailwind CSS + Nginx (Port: 8080)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    アプリケーション層                          │
│     Node.js + Express + JWT認証 (Port: 3000)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       データ層                              │
│  PostgreSQL (Port: 5432) + Redis (Port: 6379)            │
└─────────────────────────────────────────────────────────────┘
```

### 技術スタック

| 層 | 技術 | 説明 |
|---|------|------|
| **フロントエンド** | React 18, TypeScript, Tailwind CSS | モダンなSPA、型安全性、美しいUI |
| **バックエンド** | Node.js, Express, JWT | RESTful API、認証・認可 |
| **データベース** | PostgreSQL 15 | ACID準拠、高性能RDBMS |
| **キャッシュ** | Redis 7 | セッション管理、高速キャッシュ |
| **コンテナ** | Docker, Podman | 環境の一貫性、デプロイの簡素化 |
| **オーケストレーション** | OpenShift, Kubernetes | スケーラブルなクラウド展開 |

## 🚀 機能一覧

### 📊 ダッシュボード
- **リアルタイム統計情報**
- **最近のアクティビティ**
- **クイックアクション**
- **在庫アラート**
- **パフォーマンス指標**

### 📦 商品管理
- **商品情報の登録・編集・削除**
- **カテゴリ別分類**
- **在庫管理**
- **価格管理**
- **ステータス管理**

### 👥 顧客管理
- **顧客情報の一元管理**
- **企業情報の管理**
- **連絡先情報**
- **ステータス追跡**
- **検索・フィルタリング**

### 📁 カテゴリ管理
- **階層構造対応**
- **親子関係の管理**
- **カテゴリ別商品管理**
- **動的カテゴリ作成**

### 👤 ユーザー管理
- **ユーザーアカウント管理**
- **部署別管理**
- **ログイン履歴**
- **アクセス制御**

### 🛡️ ロール管理
- **細かい権限制御**
- **モジュール別権限設定**
- **CRUD操作の個別制御**
- **カスタムロール作成**

### 📈 分析・レポート
- **未実装**

### ⚙️ システム設定
- **未実装**

## 🔐 セキュリティ機能
- **未実装**

### 認証・認可
- **JWT（JSON Web Token）認証**
- **ロールベースアクセス制御（RBAC）**
- **セッション管理**
- **パスワードハッシュ化（bcrypt）**

### データ保護
- **SQL インジェクション対策**
- **XSS攻撃対策**
- **CSRF攻撃対策**
- **レート制限**
- **セキュリティヘッダー**

### 監査機能
- **操作ログ記録**
- **アクセスログ**
- **変更履歴追跡**
- **セキュリティイベント監視**

## 🛠️ 開発環境セットアップ

### 前提条件

- **Node.js** 18.0.0以上
- **npm** または **yarn**
- **Docker** または **Podman**
- **PostgreSQL** 15以上（ローカル開発の場合）
- **Redis** 7以上（ローカル開発の場合）

### クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/your-username/master-data-maintenance.git
cd master-data-maintenance

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して適切な値を設定

# Docker Composeで全サービス起動
docker-compose up -d

# または Podman Composeを使用
podman-compose up -d

# フロントエンド開発サーバー起動
npm run dev
```

### 個別サービス起動

```bash
# データベース起動
docker-compose up -d database redis

# API サーバー起動
cd api
npm install
npm run dev

# フロントエンド起動
npm run dev
```

## 🌐 デプロイメント

### Docker Compose

```bash
# 本番環境用ビルド・起動
docker-compose -f docker-compose.yml up -d

# ログ確認
docker-compose logs -f
```

### OpenShift Sandbox

```bash
# Windows環境
scripts\deploy-to-sandbox.bat

# Linux/Mac環境
./scripts/deploy-to-sandbox.sh
```

### Kubernetes

```bash
# 全リソースデプロイ
kubectl apply -k openshift/

# 状況確認
kubectl get all -n master-data-maintenance
```

## 📊 API仕様

### 認証エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/logout` | ログアウト |
| GET | `/api/auth/me` | ユーザー情報取得 |

### データ管理エンドポイント

| リソース | GET | POST | PUT | DELETE |
|---------|-----|------|-----|--------|
| `/api/products` | 一覧取得 | 新規作成 | 更新 | 削除 |
| `/api/customers` | 一覧取得 | 新規作成 | 更新 | 削除 |
| `/api/categories` | 一覧取得 | 新規作成 | 更新 | 削除 |
| `/api/users` | 一覧取得 | 新規作成 | 更新 | 削除 |
| `/api/roles` | 一覧取得 | 新規作成 | 更新 | 削除 |

### クエリパラメータ

```
GET /api/products?page=1&limit=50&search=keyword&category=electronics&status=active
```

- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 50）
- `search`: 検索キーワード
- `status`: ステータスフィルター
- その他リソース固有のフィルター

## 🗄️ データベース設計

### 主要テーブル

#### products（商品）
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### customers（顧客）
```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### roles（ロール）
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### インデックス戦略

- **パフォーマンス最適化**のための適切なインデックス
- **複合インデックス**による高速検索
- **部分インデックス**によるストレージ効率化

## 🔧 設定

### 環境変数

#### API サーバー
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=master_data
DB_USER=admin
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:8080
LOG_LEVEL=info
```

#### フロントエンド
```env
VITE_API_URL=http://localhost:3000/api
```

### Docker Compose設定

```yaml
version: '3.8'
services:
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: master_data
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

## 📈 監視・ログ

### ログ管理
- **Winston**による構造化ログ
- **ログレベル**による分類
- **ローテーション**による容量管理

### ヘルスチェック
- **API ヘルスチェックエンドポイント**
- **データベース接続確認**
- **Redis接続確認**

### メトリクス
- **レスポンス時間**
- **エラー率**
- **リクエスト数**
- **リソース使用量**

## 🧪 テスト

### テスト戦略
```bash
# ユニットテスト
npm test

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# カバレッジレポート
npm run test:coverage
```

### テスト環境
- **Jest**によるユニットテスト
- **Supertest**によるAPI テスト
- **Cypress**によるE2Eテスト

## 🚀 パフォーマンス最適化

### フロントエンド
- **コード分割**による初期ロード時間短縮
- **遅延ローディング**
- **メモ化**による再レンダリング最適化
- **バンドルサイズ最適化**

### バックエンド
- **データベースクエリ最適化**
- **Redis キャッシュ**活用
- **接続プール**による効率化
- **レート制限**による負荷制御

### インフラ
- **CDN**による静的ファイル配信
- **ロードバランサー**による負荷分散
- **オートスケーリング**

## 🔄 CI/CD

### GitHub Actions
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

### デプロイメント戦略
- **ブルーグリーンデプロイメント**
- **カナリアリリース**
- **ロールバック機能**

## 📚 ドキュメント

### 追加ドキュメント
- [アーキテクチャ詳細](README-Architecture.md)
- [Windows環境セットアップ](README-Windows.md)
- [OpenShift デプロイガイド](docs/openshift-sandbox-deployment.md)
- [トラブルシューティング](docs/windows-troubleshooting.md)

### API ドキュメント
- **Swagger/OpenAPI**仕様書
- **Postman Collection**
- **使用例とサンプルコード**

## 🤝 コントリビューション

### 開発フロー
1. **Issue**の作成
2. **Feature Branch**の作成
3. **開発・テスト**
4. **Pull Request**の作成
5. **コードレビュー**
6. **マージ**

### コーディング規約
- **ESLint**による静的解析
- **Prettier**によるコード整形
- **TypeScript**による型安全性
- **コミットメッセージ規約**

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 👥 チーム

### 開発チーム
- **プロジェクトマネージャー**: システム全体の統括
- **フロントエンド開発者**: React/TypeScript開発
- **バックエンド開発者**: Node.js/Express開発
- **データベース設計者**: PostgreSQL設計・最適化
- **DevOps エンジニア**: インフラ・デプロイメント

---

<div align="center">

**マスターデータメンテナンスシステム** - 企業データ管理の新しいスタンダード

Made with ❤️ by Development Team

</div>