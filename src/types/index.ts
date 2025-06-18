export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: {
    [module: string]: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      delete?: boolean;
    };
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'warning';
  entityType: 'product' | 'customer' | 'category' | 'user' | 'role';
  entityId: string;
  entityName: string;
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  autoHide?: boolean;
  duration?: number;
}

export type EntityType = 'products' | 'customers' | 'categories' | 'users' | 'roles';

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalCategories: number;
  totalUsers: number;
  totalRoles: number;
  activeProducts: number;
  activeCustomers: number;
  activeUsers: number;
  activeRoles: number;
  recentlyUpdated: number;
}