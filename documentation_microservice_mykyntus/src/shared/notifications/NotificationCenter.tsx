import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../../types';
import type { NotificationFilter, NotificationItem } from './notification.model';

interface Props {
  items: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCenter: React.FC<Props> = ({ items, onMarkAllRead, onMarkRead, onDelete }) => {
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const filteredNotifications = useMemo(() => {
    return items.filter((n) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.read;
      return n.type === filter;
    });
  }, [items, filter]);

  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce((acc, notification) => {
      if (!acc[notification.dateGroup]) {
        acc[notification.dateGroup] = [];
      }
      acc[notification.dateGroup].push(notification);
      return acc;
    }, {} as Record<string, NotificationItem[]>);
  }, [filteredNotifications]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              {unreadCount} Unread
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ICONS.Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['all', 'unread', 'system', 'documents'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                : 'bg-navy-900 text-slate-400 hover:bg-navy-800 hover:text-white border border-navy-800'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {Object.entries(groupedNotifications).map(([group, groupItems]) => (
          <div key={group} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{group}</h3>
            <div className="space-y-3">
              {groupItems.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card-navy p-4 flex items-start gap-4 group cursor-pointer ${
                    !notification.read ? 'border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.bgColor}`}>
                    <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-bold truncate ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{notification.description}</p>

                    <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => onMarkRead(notification.id)}
                          className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(notification.id)}
                        className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ICONS.Bell className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No notifications found</h3>
            <p className="text-slate-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

