import { useState, useCallback, useEffect } from 'react';
import { Notification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    autoHide: boolean = true,
    duration: number = 5000
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      autoHide,
      duration
    };

    setNotifications(prev => [notification, ...prev]);

    // 自動非表示
    if (autoHide) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    }

    return notification.id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAllNotifications,
    unreadCount
  };
}