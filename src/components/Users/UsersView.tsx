import React, { useState } from 'react';
import DataTable from '../DataTable/DataTable';
import UserForm from '../Forms/UserForm';
import { User } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { mockUsers } from '../../data/mockData';

const UsersView: React.FC = () => {
  const [users, setUsers] = useLocalStorage<User[]>('users', mockUsers);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '管理者';
      case 'manager': return 'マネージャー';
      case 'operator': return 'オペレーター';
      case 'viewer': return '閲覧者';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'operator': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'username',
      label: 'ユーザー名',
      sortable: true,
    },
    {
      key: 'fullName',
      label: '氏名',
      sortable: true,
    },
    {
      key: 'email',
      label: 'メールアドレス',
      sortable: true,
    },
    {
      key: 'role',
      label: 'ロール',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(value)}`}>
          {getRoleLabel(value)}
        </span>
      ),
    },
    {
      key: 'department',
      label: '部署',
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
      key: 'lastLogin',
      label: '最終ログイン',
      sortable: true,
      render: (value: string | undefined) => 
        value ? new Date(value).toLocaleDateString('ja-JP') : '未ログイン',
    },
    {
      key: 'updatedAt',
      label: '最終更新日',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('ja-JP'),
    },
  ];

  const handleAdd = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    if (user.role === 'admin') {
      alert('管理者ユーザーは削除できません。');
      return;
    }
    
    if (confirm(`ユーザー「${user.fullName}」を削除してもよろしいですか？`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleSave = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingUser) {
      // 既存ユーザーの更新
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...editingUser, ...userData, updatedAt: now }
          : u
      ));
    } else {
      // 新規ユーザーの作成
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    setShowForm(false);
    setEditingUser(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(undefined);
  };

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        title="ユーザー管理"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {showForm && (
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default UsersView;