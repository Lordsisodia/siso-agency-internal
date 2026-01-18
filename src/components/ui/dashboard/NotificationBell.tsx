import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationBellProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  maxDisplayCount?: number;
  showBadge?: boolean;
  isLoading?: boolean;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  maxDisplayCount = 5,
  showBadge = true,
  isLoading = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = notifications.slice(0, maxDisplayCount);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400 bg-green-900/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'error':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-blue-400 bg-blue-900/20';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 sm:p-3 rounded-lg transition-all duration-200 touch-manipulation',
          'hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500',
          'min-h-[44px] min-w-[44px] flex items-center justify-center',
          isOpen && 'bg-gray-700'
        )}
        disabled={isLoading}
      >
        <Bell className={cn(
          'h-5 w-5 sm:h-6 sm:w-6 transition-colors',
          unreadCount > 0 ? 'text-orange-500' : 'text-gray-400',
          isLoading && 'animate-pulse'
        )} />
        
        {/* Badge */}
        {showBadge && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute right-0 mt-2 w-80 sm:w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden',
            'max-w-[calc(100vw-2rem)] sm:max-w-none'
          )}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 sm:p-2 hover:bg-gray-700 rounded transition-colors touch-manipulation"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </button>
            </div>
            
            {/* Action buttons */}
            {notifications.length > 0 && (
              <div className="flex items-center space-x-3 sm:space-x-4 mt-2 sm:mt-3">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs sm:text-sm text-orange-500 hover:text-orange-400 transition-colors py-1 px-2 rounded touch-manipulation"
                  >
                    Mark all as read
                  </button>
                )}
                {onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors py-1 px-2 rounded touch-manipulation"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-64 sm:max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 sm:p-4 space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-gray-700 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="h-3 sm:h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-2 sm:h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <Bell className="h-8 w-8 sm:h-12 sm:w-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-400 mb-1 sm:mb-2">No notifications</p>
                <p className="text-xs sm:text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {displayNotifications.map((notification) => {
                  const NotificationIcon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'p-3 sm:p-4 hover:bg-gray-700/50 cursor-pointer transition-colors touch-manipulation',
                        !notification.read && 'bg-gray-700/20'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          getNotificationStyles(notification.type)
                        )}>
                          <NotificationIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm sm:text-base font-medium text-white truncate pr-2">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionLabel && (
                              <span className="text-xs text-orange-400 font-medium">
                                {notification.actionLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > maxDisplayCount && (
            <div className="p-3 sm:p-4 border-t border-gray-700 text-center">
              <button className="text-xs sm:text-sm text-orange-500 hover:text-orange-400 transition-colors py-2 px-4 rounded touch-manipulation">
                View all notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 