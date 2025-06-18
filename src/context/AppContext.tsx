import React, { createContext, useContext, ReactNode } from 'react';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { useNotifications } from '../hooks/useNotifications';

interface AppContextType {
  // Activity tracking
  addActivity: (
    type: 'create' | 'update' | 'delete' | 'login' | 'warning',
    entityType: 'product' | 'customer' | 'category' | 'user' | 'role',
    entityId: string,
    entityName: string,
    action: string,
    description: string,
    metadata?: Record<string, any>
  ) => void;
  getRecentActivities: (limit?: number) => any[];
  
  // Notifications
  addNotification: (
    type: 'success' | 'info' | 'warning' | 'error',
    title: string,
    message: string,
    autoHide?: boolean,
    duration?: number
  ) => string;
  notifications: any[];
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const activityTracker = useActivityTracker();
  const notificationSystem = useNotifications();

  const value: AppContextType = {
    // Activity tracking
    addActivity: activityTracker.addActivity,
    getRecentActivities: activityTracker.getRecentActivities,
    
    // Notifications
    addNotification: notificationSystem.addNotification,
    notifications: notificationSystem.notifications,
    removeNotification: notificationSystem.removeNotification,
    markAsRead: notificationSystem.markAsRead,
    unreadCount: notificationSystem.unreadCount
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}