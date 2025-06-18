import React from 'react';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification, markAsRead } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'info': return <Info className="text-blue-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return time.toLocaleDateString('ja-JP');
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className={`${getBgColor(notification.type)} border rounded-lg p-4 shadow-lg transition-all duration-300 transform hover:scale-105`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-slate-800 truncate">
                {notification.title}
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center mt-2 text-xs text-slate-500">
                <Clock size={12} className="mr-1" />
                {formatTime(notification.timestamp)}
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;