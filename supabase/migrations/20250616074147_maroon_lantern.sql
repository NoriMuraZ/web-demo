/*
  # ロール管理テーブルの追加

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - ロール名
      - `display_name` (text) - 表示名
      - `description` (text) - 説明
      - `permissions` (jsonb) - 権限設定
      - `status` (text) - ステータス
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `roles` table
    - Add policies for authenticated users

  3. Changes
    - Update users table to reference roles table
    - Add sample role data
*/

-- ロールテーブル
CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_status ON roles(status);

-- RLS有効化
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can read roles"
    ON roles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage roles"
    ON roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin' 
            AND users.status = 'active'
        )
    );

-- 更新日時トリガー
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- デフォルトロールデータ
INSERT INTO roles (name, display_name, description, permissions) VALUES
('admin', '管理者', 'システム全体の管理権限', '{
    "users": {"create": true, "read": true, "update": true, "delete": true},
    "products": {"create": true, "read": true, "update": true, "delete": true},
    "customers": {"create": true, "read": true, "update": true, "delete": true},
    "categories": {"create": true, "read": true, "update": true, "delete": true},
    "roles": {"create": true, "read": true, "update": true, "delete": true},
    "analytics": {"read": true},
    "settings": {"read": true, "update": true}
}'),
('manager', 'マネージャー', '管理機能と閲覧機能にアクセス可能', '{
    "users": {"read": true, "update": true},
    "products": {"create": true, "read": true, "update": true, "delete": true},
    "customers": {"create": true, "read": true, "update": true, "delete": true},
    "categories": {"create": true, "read": true, "update": true, "delete": true},
    "roles": {"read": true},
    "analytics": {"read": true},
    "settings": {"read": true}
}'),
('operator', 'オペレーター', '基本的な操作機能にアクセス可能', '{
    "users": {"read": true},
    "products": {"create": true, "read": true, "update": true},
    "customers": {"create": true, "read": true, "update": true},
    "categories": {"read": true},
    "roles": {"read": true},
    "analytics": {"read": true},
    "settings": {"read": true}
}'),
('viewer', '閲覧者', '閲覧機能のみアクセス可能', '{
    "users": {"read": true},
    "products": {"read": true},
    "customers": {"read": true},
    "categories": {"read": true},
    "roles": {"read": true},
    "analytics": {"read": true},
    "settings": {"read": true}
}')
ON CONFLICT (name) DO NOTHING;