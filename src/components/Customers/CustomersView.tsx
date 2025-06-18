import React, { useState } from 'react';
import DataTable from '../DataTable/DataTable';
import { Customer } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useApp } from '../../context/AppContext';
import { mockCustomers } from '../../data/mockData';

const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', mockCustomers);
  const { addActivity, addNotification } = useApp();

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
    // デモ用の新規顧客作成
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: 'サンプル顧客',
      email: 'sample@example.com',
      phone: '03-0000-0000',
      company: 'サンプル会社',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    
    // アクティビティ記録
    addActivity(
      'create',
      'customer',
      newCustomer.id,
      newCustomer.name,
      '顧客作成',
      `新しい顧客「${newCustomer.name}」が作成されました`
    );
    
    // 通知表示
    addNotification(
      'success',
      '顧客作成完了',
      `新しい顧客「${newCustomer.name}」を作成しました`
    );
  };

  const handleEdit = (customer: Customer) => {
    // デモ用の顧客更新
    const now = new Date().toISOString();
    const updatedCustomer = { ...customer, updatedAt: now };
    
    setCustomers(prev => prev.map(c => 
      c.id === customer.id ? updatedCustomer : c
    ));
    
    // アクティビティ記録
    addActivity(
      'update',
      'customer',
      customer.id,
      customer.name,
      '顧客更新',
      `顧客「${customer.name}」が更新されました`
    );
    
    // 通知表示
    addNotification(
      'success',
      '顧客更新完了',
      `顧客「${customer.name}」を更新しました`
    );
  };

  const handleDelete = (customer: Customer) => {
    if (confirm(`顧客「${customer.name}」を削除してもよろしいですか？`)) {
      setCustomers(prev => prev.filter(c => c.id !== customer.id));
      
      // アクティビティ記録
      addActivity(
        'delete',
        'customer',
        customer.id,
        customer.name,
        '顧客削除',
        `顧客「${customer.name}」が削除されました`
      );
      
      // 通知表示
      addNotification(
        'success',
        '顧客削除完了',
        `顧客「${customer.name}」を削除しました`
      );
    }
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