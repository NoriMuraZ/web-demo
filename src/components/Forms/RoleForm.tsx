import React, { useState } from 'react';
import { X, Save, Shield, Users, Package, FolderOpen, BarChart3, Settings } from 'lucide-react';
import { Role } from '../../types';

interface RoleFormProps {
  role?: Role;
  onSave: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    displayName: role?.displayName || '',
    description: role?.description || '',
    status: role?.status || 'active' as 'active' | 'inactive',
    permissions: role?.permissions || {
      users: { create: false, read: false, update: false, delete: false },
      products: { create: false, read: false, update: false, delete: false },
      customers: { create: false, read: false, update: false, delete: false },
      categories: { create: false, read: false, update: false, delete: false },
      roles: { create: false, read: false, update: false, delete: false },
      analytics: { read: false },
      settings: { read: false, update: false }
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const modules = [
    { key: 'users', label: 'ユーザー管理', icon: Users, actions: ['create', 'read', 'update', 'delete'] },
    { key: 'products', label: '商品管理', icon: Package, actions: ['create', 'read', 'update', 'delete'] },
    { key: 'customers', label: '顧客管理', icon: Users, actions: ['create', 'read', 'update', 'delete'] },
    { key: 'categories', label: 'カテゴリ管理', icon: FolderOpen, actions: ['create', 'read', 'update', 'delete'] },
    { key: 'roles', label: 'ロール管理', icon: Shield, actions: ['create', 'read', 'update', 'delete'] },
    { key: 'analytics', label: '分析・レポート', icon: BarChart3, actions: ['read'] },
    { key: 'settings', label: 'システム設定', icon: Settings, actions: ['read', 'update'] }
  ];

  const actionLabels = {
    create: '作成',
    read: '閲覧',
    update: '更新',
    delete: '削除'
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'システム名は必須です';
    if (!formData.displayName.trim()) newErrors.displayName = 'ロール名は必須です';
    if (!formData.description.trim()) newErrors.description = '説明は必須です';
    
    // システム名の形式チェック（英数字とアンダースコアのみ）
    const nameRegex = /^[a-zA-Z0-9_]+$/;
    if (formData.name && !nameRegex.test(formData.name)) {
      newErrors.name = 'システム名は英数字とアンダースコアのみ使用できます';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: checked
        }
      }
    }));
  };

  const handleSelectAllModule = (module: string, checked: boolean) => {
    const moduleConfig = modules.find(m => m.key === module);
    if (!moduleConfig) return;

    const newPermissions = { ...formData.permissions[module] };
    moduleConfig.actions.forEach(action => {
      newPermissions[action] = checked;
    });

    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: newPermissions
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">
            {role ? 'ロール編集' : '新規ロール作成'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                システム名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="admin, manager, operator など"
                disabled={!!role} // 編集時はシステム名変更不可
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ロール名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.displayName ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="管理者、マネージャー など"
              />
              {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                説明 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="このロールの権限と責任について説明してください"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">有効</option>
                <option value="inactive">無効</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-lg font-bold text-slate-800 mb-4">権限設定</h4>
            <div className="space-y-6">
              {modules.map((module) => {
                const Icon = module.icon;
                const modulePerms = formData.permissions[module.key] || {};
                const allSelected = module.actions.every(action => modulePerms[action]);
                const someSelected = module.actions.some(action => modulePerms[action]);

                return (
                  <div key={module.key} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Icon size={20} className="text-slate-600" />
                        <h5 className="font-medium text-slate-800">{module.label}</h5>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = someSelected && !allSelected;
                          }}
                          onChange={(e) => handleSelectAllModule(module.key, e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">すべて選択</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {module.actions.map((action) => (
                        <label key={action} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={modulePerms[action] || false}
                            onChange={(e) => handlePermissionChange(module.key, action, e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{actionLabels[action]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{role ? '更新' : '作成'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;