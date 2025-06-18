import React from 'react';
import { Package, Users, Folder, TrendingUp, AlertCircle, Clock, UserCog, Shield } from 'lucide-react';
import StatsCard from './StatsCard';
import { mockProducts, mockCustomers, mockCategories, mockUsers, mockRoles } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const Dashboard: React.FC = () => {
  const { getRecentActivities } = useApp();
  
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

  const recentActivities = getRecentActivities(7);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return '🆕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'login': return '🔐';
      case 'warning': return '⚠️';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'create': return 'bg-green-500';
      case 'update': return 'bg-blue-500';
      case 'delete': return 'bg-red-500';
      case 'login': return 'bg-purple-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return time.toLocaleDateString('ja-JP');
  };

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">最近のアクティビティ</h3>
            <span className="text-sm text-slate-500">
              {recentActivities.length}件のアクティビティ
            </span>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">まだアクティビティがありません</p>
              <p className="text-sm text-slate-400 mt-1">
                データの作成・更新・削除を行うとここに表示されます
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {formatActivityTime(activity.timestamp)}
                      </p>
                      {activity.userName && (
                        <span className="text-xs text-slate-400">
                          by {activity.userName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;