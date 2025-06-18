import { useState, useCallback } from 'react';
import { Activity } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useActivityTracker() {
  const [activities, setActivities] = useLocalStorage<Activity[]>('activities', []);

  const addActivity = useCallback((
    type: Activity['type'],
    entityType: Activity['entityType'],
    entityId: string,
    entityName: string,
    action: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      entityType,
      entityId,
      entityName,
      action,
      description,
      userId: 'current-user', // 実際の実装では現在のユーザーIDを使用
      userName: '管理者', // 実際の実装では現在のユーザー名を使用
      timestamp: new Date().toISOString(),
      metadata
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // 最新100件まで保持
  }, [setActivities]);

  const getRecentActivities = useCallback((limit: number = 10) => {
    return activities.slice(0, limit);
  }, [activities]);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, [setActivities]);

  return {
    activities,
    addActivity,
    getRecentActivities,
    clearActivities
  };
}