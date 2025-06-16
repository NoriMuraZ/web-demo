import React, { useState } from 'react';
import DataTable from '../DataTable/DataTable';
import { Customer } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { mockCustomers } from '../../data/mockData';

const CustomersView: React.FC = () => {
  const [customers] = useLocalStorage<Customer[]>('customers', mockCustomers);

  const columns = [
    {
      key: 'name',
      label: '顧客名',
      sortable: true,
    },
    {
      key: 'email',
      label: 'メールアドレス',
      sortable: true,
    },
    {
      key: 'phone',
      label: '電話番号',
      sortable: true,
    },
    {
      key: 'company',
      label: '会社名',
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
    console.log('顧客を追加');
  };

  const handleEdit = (customer: Customer) => {
    console.log('顧客を編集:', customer);
  };

  const handleDelete = (customer: Customer) => {
    console.log('顧客を削除:', customer);
  };

  return (
    <DataTable
      data={customers}
      columns={columns}
      title="顧客管理"
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default CustomersView;