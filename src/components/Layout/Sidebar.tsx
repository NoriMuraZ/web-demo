import React from 'react';
import { Home, Package, Users, Folder, BarChart3, Settings, UserCog, Shield } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home },
    { id: 'products', label: '商品管理', icon: Package },
    { id: 'customers', label: '顧客管理', icon: Users },
    { id: 'categories', label: 'カテゴリ管理', icon: Folder },
    { id: 'users', label: 'ユーザー管理', icon: UserCog },
    { id: 'roles', label: 'ロール管理', icon: Shield },
    { id: 'analytics', label: '分析・レポート', icon: BarChart3 },
    { id: 'settings', label: 'システム設定', icon: Settings },
  ];

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-blue-400">マスターデータ</h1>
        <p className="text-slate-400 text-sm">メンテナンスシステム</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;