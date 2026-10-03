import React, { useState } from 'react';
import { X, Bell, Package, Sparkles, RefreshCw, CheckCheck, Trash2, ArrowUpRight, Heart } from 'lucide-react';
import { StoreNotification } from '../types/store';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: StoreNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onDeleteNotification?: (id: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onOpenOrders?: (orderNumber?: string) => void;
  topClass?: string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onClearAll,
  onDeleteNotification,
  onNavigateToProduct,
  onOpenOrders,
  topClass,
}) => {
  const [filter, setFilter] = useState<'all' | 'drop' | 'restock' | 'order'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(
    (n) => filter === 'all' || n.type === filter || (filter === 'drop' && (n.type === 'product' || n.type === 'drop'))
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatNotificationDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === 1 || (diffDays < 2 && date.getDate() === now.getDate() - 1)) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getIcon = (type: StoreNotification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'drop':
      case 'product':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'restock':
        return <RefreshCw className="w-4 h-4 text-emerald-600" />;
      case 'wishlist':
        return <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />;
      case 'promo':
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleItemClick = (notification: StoreNotification) => {
    onMarkAsRead(notification.id);
    if (notification.type === 'order' && onOpenOrders) {
      onOpenOrders(notification.linkTarget);
      onClose();
    } else if (notification.linkTarget) {
      onNavigateToProduct(notification.linkTarget);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-x-0 bottom-0 ${topClass || 'top-[56px] sm:top-[68px] lg:top-[72px]'} z-40 overflow-hidden pointer-events-none`}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/25 transition-opacity cursor-pointer pointer-events-auto"
      />

      <div className="absolute top-0 bottom-0 right-0 max-w-full flex pl-0 pointer-events-auto">
        <div className="w-full md:w-[420px] bg-white shadow-2xl flex flex-col border-l border-zinc-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-zinc-900" />
              <h2 className="text-lg font-display font-medium text-zinc-950">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold text-white bg-zinc-950 px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="px-6 py-3 border-b border-zinc-100 bg-[#FAF9F6] flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'drop', label: 'Drops' },
                { id: 'restock', label: 'Restocks' },
                { id: 'order', label: 'Orders' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                    filter === tab.id
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                title="Mark all as read"
                className="text-xs text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-zinc-900">No notifications found</p>
                <p className="text-xs text-zinc-500">
                  You are all caught up with GLADYNS product updates and shipments.
                </p>
              </div>
            ) : (
              (() => {
                // Pre-filter the notifications into their respective scannable groups
                const ordersGroup = filteredNotifications.filter(n => n.type === 'order');
                const promosGroup = filteredNotifications.filter(n => ['drop', 'promo', 'restock', 'product'].includes(n.type));
                const accountGroup = filteredNotifications.filter(n => n.type === 'wishlist');

                const groups = [
                  {
                    id: 'orders',
                    title: 'Orders & Shipments',
                    items: ordersGroup,
                    badgeStyle: 'bg-blue-50 text-blue-700 border border-blue-100',
                  },
                  {
                    id: 'promos',
                    title: 'Promotions & Drops',
                    items: promosGroup,
                    badgeStyle: 'bg-amber-50 text-amber-700 border border-amber-100',
                  },
                  {
                    id: 'account',
                    title: 'Account & Wishlist',
                    items: accountGroup,
                    badgeStyle: 'bg-blue-50 text-blue-700 border border-blue-100',
                  },
                ];

                return (
                  <div className="space-y-6">
                    {groups.map((group) => {
                      if (group.items.length === 0) return null;

                      const unreadInGroup = group.items.filter(n => !n.read).length;

                      return (
                        <div key={group.id} className="space-y-2.5">
                          {/* Sticky Group Header with visual scan badges */}
                          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100/80">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {group.title}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${group.badgeStyle}`}>
                                {group.items.length}
                              </span>
                            </div>
                            {unreadInGroup > 0 && (
                              <span className="text-[9px] font-black tracking-wider uppercase text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse" />
                                {unreadInGroup} NEW
                              </span>
                            )}
                          </div>

                          {/* Group Content */}
                          <div className="space-y-2.5">
                            {group.items.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleItemClick(notif)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                                  notif.read
                                    ? 'bg-white border-zinc-200/70 hover:border-zinc-300'
                                    : 'bg-zinc-50/90 border-zinc-300 shadow-xs hover:border-zinc-950'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-white border border-zinc-200 shadow-xs shrink-0 mt-0.5">
                                    {getIcon(notif.type)}
                                  </div>

                                  <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="text-xs font-semibold text-zinc-900 leading-snug">
                                        {notif.title}
                                      </h4>
                                      <div className="flex items-center gap-1 shrink-0 -mt-0.5">
                                        {!notif.read && (
                                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                                        )}
                                        {onDeleteNotification && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onDeleteNotification(notif.id);
                                            }}
                                            title="Delete notification"
                                            className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                                      {notif.message}
                                    </p>

                                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-100">
                                      <span className="text-[11px] text-zinc-400 font-mono">
                                        {formatNotificationDate(notif.timestamp)}
                                      </span>

                                      {notif.linkTarget && (
                                        <span className="text-[11px] font-medium text-zinc-900 flex items-center gap-0.5 hover:underline">
                                          <span>View item</span>
                                          <ArrowUpRight className="w-3 h-3" />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
              <span>Real-time drop alerts</span>
              <button
                onClick={onClearAll}
                className="text-xs text-zinc-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear history</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
