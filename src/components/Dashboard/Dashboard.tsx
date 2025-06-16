import React from 'react';
import { Package, Users, Folder, TrendingUp, AlertCircle, Clock, UserCog, Shield } from 'lucide-react';
import StatsCard from './StatsCard';
import { mockProducts, mockCustomers, mockCategories, mockUsers, mockRoles } from '../../data/mockData';

const Dashboard: React.FC = () => {
  const stats = {
    totalProducts: mockProducts.length,
    totalCustomers: mockCustomers.length,
    totalCategories: mockCategories.length,
    totalUsers: mockUsers.length,
    totalRoles: mockRoles.length,
    activeProducts: mockProducts.filter(p => p.status === 'active').length,
    activeCustomers: mockCustomers.filter(c => c.status === 'active').length,
    activeUsers: mockUsers.filter(u => u.status === 'active').length,
    activeRoles: mockRoles.filter(r => r.status === 'active').length,
    lowStock: mockProducts.filter(p => p.stock < 10).length,
  };

  const recentActivity = [
    { id: 1, action: '商品「スマートウォッチ」が更新されました', time: '2時間前', type: 'update' },
    { id: 2, action: '新規顧客「田中太郎」が追加されました', time: '4時間前', type: 'create' },
    { id: 3, action: 'ユーザー「佐藤次郎」がログインしました', time: '6時間前', type: 'login' },
    { id: 4, action: 'ロール「オペレーター」の権限が変更されました', time: '8時間前', type: 'update' },
    { id: 5, action: 'カテゴリ「電子機器」が変更されました', time: '1日前', type: 'update' },
    { id: 6, action: '商品「オフィスチェア」が無効化されました', time: '2日前', type: 'delete' },
    { id: 7, action: '在庫アラート：ノートパソコンの在庫が少なくなっています', time: '3日前', type: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="総商品数"
          value={stats.totalProducts}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="総顧客数"
          value={stats.totalCustomers}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="総ユーザー数"
          value={stats.totalUsers}
          icon={UserCog}
          trend={{ value: 5, isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="在庫不足商品"
          value={stats.lowStock}
          icon={AlertCircle}
          trend={{ value: 15, isPositive: false }}
          color="red"
        />
      </div>

      {/* 追加統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="総ロール数"
          value={stats.totalRoles}
          icon={Shield}
          trend={{ value: 0, isPositive: true }}
          color="yellow"
        />
        <StatsCard
          title="総カテゴリ数"
          value={stats.totalCategories}
          icon={Folder}
          trend={{ value: 2, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="有効ユーザー数"
          value={stats.activeUsers}
          icon={UserCog}
          trend={{ value: 10, isPositive: true }}
          color="blue"
        />
      </div>

      {/* クイックアクションと最近のアクティビティ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* クイックアクション */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">クイックアクション</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg text-left transition-colors">
              <div className="flex items-center space-x-3">
                <Package className="text-blue-500" size={20} />
                <div>
                  <p className="font-medium">新規商品登録</p>
                  <p className="text-sm text-blue-600">新しい商品を登録します</p>
                </div>
              </div>
            </button>
            <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg text-left transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="text-green-500" size={20} />
                <div>
                  <p className="font-medium">新規顧客登録</p>
                  <p className="text-sm text-green-600">新しい顧客を登録します</p>
                </div>
              </div>
            </button>
            <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg text-left transition-colors">
              <div className="flex items-center space-x-3">
                <UserCog className="text-purple-500" size={20} />
                <div>
                  <p className="font-medium">新規ユーザー登録</p>
                  <p className="text-sm text-purple-600">新しいユーザーを登録します</p>
                </div>
              </div>
            </button>
            <button className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg text-left transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="text-yellow-500" size={20} />
                <div>
                  <p className="font-medium">新規ロール作成</p>
                  <p className="text-sm text-yellow-600">新しいロールを作成します</p>
                </div>
              </div>
            </button>
            <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg text-left transition-colors">
              <div className="flex items-center space-x-3">
                <TrendingUp className="text-orange-500" size={20} />
                <div>
                  <p className="font-medium">レポート生成</p>
                  <p className="text-sm text-orange-600">データ分析レポートを作成します</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">最近のアクティビティ</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'create' ? 'bg-green-500' :
                  activity.type === 'update' ? 'bg-blue-500' : 
                  activity.type === 'login' ? 'bg-purple-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-slate-800 text-sm">{activity.action}</p>
                  <p className="text-slate-500 text-xs flex items-center mt-1">
                    <Clock size={12} className="mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;