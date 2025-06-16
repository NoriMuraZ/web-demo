import React, { useState } from 'react';
import DataTable from '../DataTable/DataTable';
import RoleForm from '../Forms/RoleForm';
import { Role } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { mockRoles } from '../../data/mockData';

const RolesView: React.FC = () => {
  const [roles, setRoles] = useLocalStorage<Role[]>('roles', mockRoles);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>();

  const columns = [
    {
      key: 'displayName',
      label: 'ロール名',
      sortable: true,
    },
    {
      key: 'name',
      label: 'システム名',
      sortable: true,
      render: (value: string) => (
        <code className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm font-mono">
          {value}
        </code>
      ),
    },
    {
      key: 'description',
      label: '説明',
      sortable: true,
    },
    {
      key: 'permissions',
      label: '権限数',
      sortable: false,
      render: (value: any) => {
        const totalPermissions = Object.values(value).reduce((total: number, modulePerms: any) => {
          return total + Object.values(modulePerms).filter(Boolean).length;
        }, 0);
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {totalPermissions}個の権限
          </span>
        );
      },
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
    setEditingRole(undefined);
    setShowForm(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleDelete = (role: Role) => {
    if (role.name === 'admin') {
      alert('管理者ロールは削除できません。');
      return;
    }
    
    if (confirm(`ロール「${role.displayName}」を削除してもよろしいですか？`)) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
    }
  };

  const handleSave = (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingRole) {
      // 既存ロールの更新
      setRoles(prev => prev.map(r => 
        r.id === editingRole.id 
          ? { ...editingRole, ...roleData, updatedAt: now }
          : r
      ));
    } else {
      // 新規ロールの作成
      const newRole: Role = {
        ...roleData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      setRoles(prev => [...prev, newRole]);
    }
    
    setShowForm(false);
    setEditingRole(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRole(undefined);
  };

  return (
    <>
      <DataTable
        data={roles}
        columns={columns}
        title="ロール管理"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {showForm && (
        <RoleForm
          role={editingRole}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default RolesView;