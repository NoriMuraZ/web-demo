import React from 'react';
import DataTable from '../DataTable/DataTable';
import { Category } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useApp } from '../../context/AppContext';
import { mockCategories } from '../../data/mockData';

const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', mockCategories);
  const { addActivity, addNotification } = useApp();

  const columns = [
    {
      key: 'name',
      label: 'カテゴリ名',
      sortable: true,
    },
    {
      key: 'description',
      label: '説明',
      sortable: true,
    },
    {
      key: 'status',
      label: 'ステータス',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'active' ? '有効' : '無効'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: '最終更新日',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('ja-JP'),
    },
  ];

  const handleAdd = () => {
    // デモ用の新規カテゴリ作成
    const now = new Date().toISOString();
    const newCategory: Category = {
      id: Date.now().toString(),
      name: 'サンプルカテゴリ',
      description: 'サンプルカテゴリの説明',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    
    setCategories(prev => [...prev, newCategory]);
    
    // アクティビティ記録
    addActivity(
      'create',
      'category',
      newCategory.id,
      newCategory.name,
      'カテゴリ作成',
      `新しいカテゴリ「${newCategory.name}」が作成されました`
    );
    
    // 通知表示
    addNotification(
      'success',
      'カテゴリ作成完了',
      `新しいカテゴリ「${newCategory.name}」を作成しました`
    );
  };

  const handleEdit = (category: Category) => {
    // デモ用のカテゴリ更新
    const now = new Date().toISOString();
    const updatedCategory = { ...category, updatedAt: now };
    
    setCategories(prev => prev.map(c => 
      c.id === category.id ? updatedCategory : c
    ));
    
    // アクティビティ記録
    addActivity(
      'update',
      'category',
      category.id,
      category.name,
      'カテゴリ更新',
      `カテゴリ「${category.name}」が更新されました`
    );
    
    // 通知表示
    addNotification(
      'success',
      'カテゴリ更新完了',
      `カテゴリ「${category.name}」を更新しました`
    );
  };

  const handleDelete = (category: Category) => {
    if (confirm(`カテゴリ「${category.name}」を削除してもよろしいですか？`)) {
      setCategories(prev => prev.filter(c => c.id !== category.id));
      
      // アクティビティ記録
      addActivity(
        'delete',
        'category',
        category.id,
        category.name,
        'カテゴリ削除',
        `カテゴリ「${category.name}」が削除されました`
      );
      
      // 通知表示
      addNotification(
        'success',
        'カテゴリ削除完了',
        `カテゴリ「${category.name}」を削除しました`
      );
    }
  };

  return (
    <DataTable
      data={categories}
      columns={columns}
      title="カテゴリ管理"
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default CategoriesView;