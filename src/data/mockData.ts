import { Product, Customer, Category, User, Role } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'ワイヤレスヘッドフォン',
    category: '電子機器',
    price: 12800,
    stock: 50,
    description: 'ノイズキャンセリング機能付き高品質ワイヤレスヘッドフォン',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'スマートウォッチ',
    category: '電子機器',
    price: 38500,
    stock: 25,
    description: 'ヘルスモニタリング機能搭載の高機能スマートウォッチ',
    status: 'active',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-12-14T16:45:00Z'
  },
  {
    id: '3',
    name: 'オフィスチェア',
    category: '家具',
    price: 25600,
    stock: 0,
    description: '腰部サポート付きエルゴノミクスオフィスチェア',
    status: 'inactive',
    createdAt: '2024-03-05T11:30:00Z',
    updatedAt: '2024-12-10T12:00:00Z'
  },
  {
    id: '4',
    name: 'コーヒーメーカー',
    category: '家電',
    price: 10240,
    stock: 15,
    description: 'プログラマブルタイマー付き自動ドリップコーヒーメーカー',
    status: 'active',
    createdAt: '2024-04-20T08:45:00Z',
    updatedAt: '2024-12-12T10:15:00Z'
  },
  {
    id: '5',
    name: 'ノートパソコン',
    category: '電子機器',
    price: 89800,
    stock: 8,
    description: '高性能プロセッサ搭載の軽量ノートパソコン',
    status: 'active',
    createdAt: '2024-05-01T12:00:00Z',
    updatedAt: '2024-12-13T09:20:00Z'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '田中 太郎',
    email: 'tanaka.taro@example.com',
    phone: '03-1234-5678',
    company: '株式会社テックソリューション',
    status: 'active',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-12-15T09:30:00Z'
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato.hanako@example.com',
    phone: '03-2345-6789',
    company: '有限会社デザインスタジオ',
    status: 'active',
    createdAt: '2024-02-15T16:20:00Z',
    updatedAt: '2024-12-14T11:45:00Z'
  },
  {
    id: '3',
    name: '鈴木 一郎',
    email: 'suzuki.ichiro@example.com',
    phone: '03-3456-7890',
    company: 'マーケティングプロ株式会社',
    status: 'inactive',
    createdAt: '2024-03-10T13:15:00Z',
    updatedAt: '2024-12-01T15:20:00Z'
  },
  {
    id: '4',
    name: '高橋 美咲',
    email: 'takahashi.misaki@example.com',
    phone: '03-4567-8901',
    company: 'イノベーション企画',
    status: 'active',
    createdAt: '2024-04-05T10:30:00Z',
    updatedAt: '2024-12-12T14:15:00Z'
  }
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: '電子機器',
    description: '電子デバイスおよびガジェット類',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z'
  },
  {
    id: '2',
    name: '家具',
    description: '家庭用およびオフィス用家具',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-10T14:30:00Z'
  },
  {
    id: '3',
    name: '家電',
    description: '家庭用およびキッチン家電製品',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-12T16:15:00Z'
  },
  {
    id: '4',
    name: '文房具',
    description: 'オフィス用品および文房具類',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-08T11:45:00Z'
  }
];

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    displayName: '管理者',
    description: 'システム全体の管理権限',
    permissions: {
      users: { create: true, read: true, update: true, delete: true },
      products: { create: true, read: true, update: true, delete: true },
      customers: { create: true, read: true, update: true, delete: true },
      categories: { create: true, read: true, update: true, delete: true },
      roles: { create: true, read: true, update: true, delete: true },
      analytics: { read: true },
      settings: { read: true, update: true }
    },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'manager',
    displayName: 'マネージャー',
    description: '管理機能と閲覧機能にアクセス可能',
    permissions: {
      users: { read: true, update: true },
      products: { create: true, read: true, update: true, delete: true },
      customers: { create: true, read: true, update: true, delete: true },
      categories: { create: true, read: true, update: true, delete: true },
      roles: { read: true },
      analytics: { read: true },
      settings: { read: true }
    },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-10T14:30:00Z'
  },
  {
    id: '3',
    name: 'operator',
    displayName: 'オペレーター',
    description: '基本的な操作機能にアクセス可能',
    permissions: {
      users: { read: true },
      products: { create: true, read: true, update: true },
      customers: { create: true, read: true, update: true },
      categories: { read: true },
      roles: { read: true },
      analytics: { read: true },
      settings: { read: true }
    },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-12T16:15:00Z'
  },
  {
    id: '4',
    name: 'viewer',
    displayName: '閲覧者',
    description: '閲覧機能のみアクセス可能',
    permissions: {
      users: { read: true },
      products: { read: true },
      customers: { read: true },
      categories: { read: true },
      roles: { read: true },
      analytics: { read: true },
      settings: { read: true }
    },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-08T11:45:00Z'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    fullName: '管理者 太郎',
    role: 'admin',
    department: 'システム管理部',
    status: 'active',
    lastLogin: '2024-12-15T09:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-15T09:30:00Z'
  },
  {
    id: '2',
    username: 'manager01',
    email: 'yamada.hanako@company.com',
    fullName: '山田 花子',
    role: 'manager',
    department: '営業部',
    status: 'active',
    lastLogin: '2024-12-14T16:45:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-12-14T16:45:00Z'
  },
  {
    id: '3',
    username: 'operator01',
    email: 'sato.jiro@company.com',
    fullName: '佐藤 次郎',
    role: 'operator',
    department: '商品管理部',
    status: 'active',
    lastLogin: '2024-12-13T14:20:00Z',
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-12-13T14:20:00Z'
  },
  {
    id: '4',
    username: 'viewer01',
    email: 'tanaka.saburo@company.com',
    fullName: '田中 三郎',
    role: 'viewer',
    department: '経理部',
    status: 'active',
    lastLogin: '2024-12-12T11:15:00Z',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-12-12T11:15:00Z'
  },
  {
    id: '5',
    username: 'operator02',
    email: 'suzuki.yuki@company.com',
    fullName: '鈴木 雪',
    role: 'operator',
    department: '顧客管理部',
    status: 'inactive',
    lastLogin: '2024-11-28T10:30:00Z',
    createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z'
  }
];