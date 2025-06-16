import React from 'react';
import DataTable from '../DataTable/DataTable';
import { Category } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { mockCategories } from '../../data/mockData';

const CategoriesView: React.FC = () => {
  const [categories] = useLocalStorage<Category[]>('categories', mockCategories);

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
    console.log('カテゴリを追加');
  };

  const handleEdit = (category: Category) => {
    console.log('カテゴリを編集:', category);
  };

  const handleDelete = (category: Category) => {
    console.log('カテゴリを削除:', category);
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