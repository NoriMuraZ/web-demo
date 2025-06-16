-- サンプルデータ投入スクリプト

-- カテゴリデータ
INSERT INTO categories (name, description) VALUES
('電子機器', '電子デバイスおよびガジェット類'),
('家具', '家庭用およびオフィス用家具'),
('家電', '家庭用およびキッチン家電製品'),
('文房具', 'オフィス用品および文房具類')
ON CONFLICT (name) DO NOTHING;

-- ユーザーデータ（パスワードは実際にはハッシュ化する）
INSERT INTO users (username, email, password_hash, full_name, role, department) VALUES
('admin', 'admin@company.com', '$2a$10$example.hash.for.password123', '管理者 太郎', 'admin', 'システム管理部'),
('manager01', 'yamada.hanako@company.com', '$2a$10$example.hash.for.password123', '山田 花子', 'manager', '営業部'),
('operator01', 'sato.jiro@company.com', '$2a$10$example.hash.for.password123', '佐藤 次郎', 'operator', '商品管理部'),
('viewer01', 'tanaka.saburo@company.com', '$2a$10$example.hash.for.password123', '田中 三郎', 'viewer', '経理部'),
('operator02', 'suzuki.yuki@company.com', '$2a$10$example.hash.for.password123', '鈴木 雪', 'operator', '顧客管理部')
ON CONFLICT (username) DO NOTHING;

-- 商品データ
INSERT INTO products (name, category, price, stock, description) VALUES
('ワイヤレスヘッドフォン', '電子機器', 12800, 50, 'ノイズキャンセリング機能付き高品質ワイヤレスヘッドフォン'),
('スマートウォッチ', '電子機器', 38500, 25, 'ヘルスモニタリング機能搭載の高機能スマートウォッチ'),
('オフィスチェア', '家具', 25600, 0, '腰部サポート付きエルゴノミクスオフィスチェア'),
('コーヒーメーカー', '家電', 10240, 15, 'プログラマブルタイマー付き自動ドリップコーヒーメーカー'),
('ノートパソコン', '電子機器', 89800, 8, '高性能プロセッサ搭載の軽量ノートパソコン');

-- 顧客データ
INSERT INTO customers (name, email, phone, company) VALUES
('田中 太郎', 'tanaka.taro@example.com', '03-1234-5678', '株式会社テックソリューション'),
('佐藤 花子', 'sato.hanako@example.com', '03-2345-6789', '有限会社デザインスタジオ'),
('鈴木 一郎', 'suzuki.ichiro@example.com', '03-3456-7890', 'マーケティングプロ株式会社'),
('高橋 美咲', 'takahashi.misaki@example.com', '03-4567-8901', 'イノベーション企画');

-- 一部商品を無効化
UPDATE products SET status = 'inactive' WHERE name = 'オフィスチェア';

-- 一部顧客を無効化
UPDATE customers SET status = 'inactive' WHERE name = '鈴木 一郎';

-- 一部ユーザーを無効化
UPDATE users SET status = 'inactive' WHERE username = 'operator02';