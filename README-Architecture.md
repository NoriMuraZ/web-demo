# Web3層アーキテクチャ構成

## アーキテクチャ概要

このマスターデータメンテナンスシステムは、Web3層アーキテクチャで構成されています：

```
┌─────────────────────┐
│  プレゼンテーション層  │  React + Nginx (Port: 8080)
│   (Frontend)       │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   アプリケーション層   │  Node.js + Express (Port: 3000)
│      (API)         │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│     データ層        │  PostgreSQL (Port: 5432)
│   (Database)       │  Redis (Port: 6379)
└─────────────────────┘
```

## 各層の詳細

### 1. プレゼンテーション層 (Frontend)
- **技術**: React + TypeScript + Tailwind CSS
- **Webサーバー**: Nginx
- **ポート**: 8080
- **役割**: ユーザーインターフェース、ユーザー体験の提供

### 2. アプリケーション層 (API)
- **技術**: Node.js + Express
- **ポート**: 3000
- **役割**: ビジネスロジック、API提供、認証・認可
- **機能**:
  - RESTful API
  - JWT認証
  - レート制限
  - ログ管理
  - バリデーション

### 3. データ層 (Database)
- **メインDB**: PostgreSQL (Port: 5432)
- **キャッシュ**: Redis (Port: 6379)
- **役割**: データ永続化、セッション管理、キャッシュ

## 起動方法

### Docker Composeを使用
```bash
# 全サービス起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

### Podman Composeを使用
```bash
# 全サービス起動
podman-compose up -d

# ログ確認
podman-compose logs -f

# 停止
podman-compose down
```

## サービス構成

| サービス名 | コンテナ名 | ポート | 説明 |
|-----------|-----------|--------|------|
| frontend | master-data-frontend | 8080 | React Webアプリケーション |
| api | master-data-api | 3000 | Node.js APIサーバー |
| database | master-data-db | 5432 | PostgreSQLデータベース |
| redis | master-data-redis | 6379 | Redisキャッシュサーバー |

## 環境変数

### API サービス
- `NODE_ENV`: 実行環境 (production/development)
- `PORT`: APIサーバーポート
- `DB_HOST`: データベースホスト
- `DB_PORT`: データベースポート
- `DB_NAME`: データベース名
- `DB_USER`: データベースユーザー
- `DB_PASSWORD`: データベースパスワード
- `REDIS_HOST`: Redisホスト
- `REDIS_PORT`: Redisポート
- `JWT_SECRET`: JWT署名キー
- `CORS_ORIGIN`: CORS許可オリジン

### Database サービス
- `POSTGRES_DB`: データベース名
- `POSTGRES_USER`: データベースユーザー
- `POSTGRES_PASSWORD`: データベースパスワード

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - ユーザー情報取得

### 商品管理
- `GET /api/products` - 商品一覧取得
- `GET /api/products/:id` - 商品詳細取得
- `POST /api/products` - 商品作成
- `PUT /api/products/:id` - 商品更新
- `DELETE /api/products/:id` - 商品削除

### 顧客管理
- `GET /api/customers` - 顧客一覧取得
- `GET /api/customers/:id` - 顧客詳細取得
- `POST /api/customers` - 顧客作成
- `PUT /api/customers/:id` - 顧客更新
- `DELETE /api/customers/:id` - 顧客削除

### カテゴリ管理
- `GET /api/categories` - カテゴリ一覧取得
- `GET /api/categories/:id` - カテゴリ詳細取得
- `POST /api/categories` - カテゴリ作成
- `PUT /api/categories/:id` - カテゴリ更新
- `DELETE /api/categories/:id` - カテゴリ削除

### ユーザー管理
- `GET /api/users` - ユーザー一覧取得
- `GET /api/users/:id` - ユーザー詳細取得
- `POST /api/users` - ユーザー作成
- `PUT /api/users/:id` - ユーザー更新
- `DELETE /api/users/:id` - ユーザー削除

## データベーススキーマ

### products テーブル
- `id`: 商品ID (SERIAL PRIMARY KEY)
- `name`: 商品名 (VARCHAR(255))
- `category`: カテゴリ (VARCHAR(100))
- `price`: 価格 (DECIMAL(10,2))
- `stock`: 在庫数 (INTEGER)
- `description`: 商品説明 (TEXT)
- `status`: ステータス (VARCHAR(20))
- `created_at`: 作成日時 (TIMESTAMP)
- `updated_at`: 更新日時 (TIMESTAMP)

### customers テーブル
- `id`: 顧客ID (SERIAL PRIMARY KEY)
- `name`: 顧客名 (VARCHAR(255))
- `email`: メールアドレス (VARCHAR(255))
- `phone`: 電話番号 (VARCHAR(50))
- `company`: 会社名 (VARCHAR(255))
- `status`: ステータス (VARCHAR(20))
- `created_at`: 作成日時 (TIMESTAMP)
- `updated_at`: 更新日時 (TIMESTAMP)

### categories テーブル
- `id`: カテゴリID (SERIAL PRIMARY KEY)
- `name`: カテゴリ名 (VARCHAR(100))
- `description`: 説明 (TEXT)
- `parent_id`: 親カテゴリID (INTEGER)
- `status`: ステータス (VARCHAR(20))
- `created_at`: 作成日時 (TIMESTAMP)
- `updated_at`: 更新日時 (TIMESTAMP)

### users テーブル
- `id`: ユーザーID (SERIAL PRIMARY KEY)
- `username`: ユーザー名 (VARCHAR(50))
- `email`: メールアドレス (VARCHAR(255))
- `password_hash`: パスワードハッシュ (VARCHAR(255))
- `full_name`: 氏名 (VARCHAR(255))
- `role`: ロール (VARCHAR(20))
- `department`: 部署 (VARCHAR(100))
- `status`: ステータス (VARCHAR(20))
- `last_login`: 最終ログイン (TIMESTAMP)
- `created_at`: 作成日時 (TIMESTAMP)
- `updated_at`: 更新日時 (TIMESTAMP)

## セキュリティ機能

- JWT認証
- パスワードハッシュ化 (bcrypt)
- レート制限
- CORS設定
- セキュリティヘッダー (Helmet.js)
- SQL インジェクション対策 (パラメータ化クエリ)

## 監視・ログ

- アプリケーションログ (Winston)
- ヘルスチェックエンドポイント
- コンテナヘルスチェック
- アクセスログ (Morgan)

## 開発・デバッグ

### ログ確認
```bash
# 全サービスのログ
podman-compose logs -f

# 特定サービスのログ
podman-compose logs -f api
podman-compose logs -f database
```

### データベース接続
```bash
# PostgreSQLに接続
podman exec -it master-data-db psql -U admin -d master_data

# Redisに接続
podman exec -it master-data-redis redis-cli -a redis123
```

### 開発用起動
```bash
# 開発モードで起動（ホットリロード有効）
cd api && npm run dev
cd .. && npm run dev
```

## 本番環境への展開

1. 環境変数の設定（特にシークレット情報）
2. SSL/TLS証明書の設定
3. リバースプロキシの設定
4. データベースバックアップの設定
5. 監視・アラートの設定
6. ログローテーションの設定