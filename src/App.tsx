import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import ProductsView from './components/Products/ProductsView';
import CustomersView from './components/Customers/CustomersView';
import CategoriesView from './components/Categories/CategoriesView';
import UsersView from './components/Users/UsersView';
import RolesView from './components/Roles/RolesView';
import NotificationCenter from './components/Notifications/NotificationCenter';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'ダッシュボード';
      case 'products': return '商品管理';
      case 'customers': return '顧客管理';
      case 'categories': return 'カテゴリ管理';
      case 'users': return 'ユーザー管理';
      case 'roles': return 'ロール管理';
      case 'analytics': return '分析・レポート';
      case 'settings': return 'システム設定';
      default: return 'ダッシュボード';
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductsView />;
      case 'customers': return <CustomersView />;
      case 'categories': return <CategoriesView />;
      case 'users': return <UsersView />;
      case 'roles': return <RolesView />;
      case 'analytics': 
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-4">分析・レポート機能</h3>
            <p className="text-slate-600">高度な分析とレポート機能は近日公開予定です。</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-4">システム設定</h3>
            <p className="text-slate-600">システム設定と環境設定を管理します。</p>
          </div>
        );
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col">
        <Header title={getViewTitle()} />
        
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
      
      <NotificationCenter />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;