import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, FileText, Settings, XCircle } from 'lucide-react';

export type NotificationFilter = 'all' | 'unread' | 'documents' | 'system';

export interface NotificationCenterItem {
  id: string;
  type: 'documents' | 'system';
  title: string;
  description: string;
  timestamp: string;
  dateGroup: string;
  read: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

interface NotificationCenterProps {
  title?: string;
  unreadLabel?: string;
  markAllLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  items: NotificationCenterItem[];
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  actionLabel?: string;
  onAction?: (id: string) => void;
  filters?: NotificationFilter[];
}

const FILTER_LABELS: Record<NotificationFilter, string> = {
  all: 'Toutes',
  unread: 'Non lues',
  documents: 'Parrainages',
  system: 'Système',
};

export function NotificationCenter({
  title = 'Notifications',
  unreadLabel = 'Non lues',
  markAllLabel = 'Tout marquer comme lu',
  emptyTitle = 'Aucune notification',
  emptyDescription = 'Vous êtes à jour !',
  items,
  onMarkAllRead,
  onMarkRead,
  onAction,
  actionLabel = 'Ouvrir la page associée',
  filters = ['all', 'unread', 'documents', 'system'],
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const filteredNotifications = useMemo(() => {
    return items.filter((n) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.read;
      return n.type === filter;
    });
  }, [items, filter]);

  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce((acc, n) => {
      if (!acc[n.dateGroup]) acc[n.dateGroup] = [];
      acc[n.dateGroup].push(n);
      return acc;
    }, {} as Record<string, NotificationCenterItem[]>);
  }, [filteredNotifications]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              {unreadCount} {unreadLabel}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {markAllLabel}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                : 'bg-navy-900 text-slate-400 hover:bg-navy-800 hover:text-white border border-navy-800'
            }`}
          >
            {FILTER_LABELS[f]}
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
                      {onAction && (
                        <button
                          type="button"
                          onClick={() => onAction(notification.id)}
                          className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {actionLabel}
                        </button>
                      )}
                      {!notification.read && onMarkRead && (
                        <button
                          type="button"
                          onClick={() => onMarkRead(notification.id)}
                          className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                        >
                          Marquer comme lu
                        </button>
                      )}
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
              <Bell className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{emptyTitle}</h3>
            <p className="text-slate-400">{emptyDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function mapReferralNotificationToCenter(item: {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  read: boolean;
}): NotificationCenterItem {
  const isReject =
    item.message.toLowerCase().includes('reject') ||
    item.message.toLowerCase().includes('refus') ||
    item.message.toLowerCase().includes('rejet');
  const isReward = item.type === 'REFERRAL_REWARDED';
  const isNew = item.type === 'NEW_REFERRAL';

  let icon: NotificationCenterItem['icon'] = Bell;
  let iconColor = 'text-purple-500';
  let bgColor = 'bg-purple-500/10';
  let type: NotificationCenterItem['type'] = 'documents';

  if (isReject) {
    icon = XCircle;
    iconColor = 'text-red-500';
    bgColor = 'bg-red-500/10';
  } else if (isReward || isNew) {
    icon = isNew ? FileText : CheckCircle2;
    iconColor = isReward ? 'text-emerald-500' : 'text-blue-500';
    bgColor = isReward ? 'bg-emerald-500/10' : 'bg-blue-500/10';
  } else if (item.type === 'STATUS_CHANGED') {
    icon = Settings;
    iconColor = 'text-purple-500';
    bgColor = 'bg-purple-500/10';
    type = 'system';
  }

  return {
    id: item.id,
    type,
    icon,
    title:
      item.type === 'NEW_REFERRAL'
        ? 'Nouveau parrainage soumis'
        : item.type === 'REFERRAL_REWARDED'
          ? 'Prime de parrainage versée'
          : item.type === 'STATUS_CHANGED'
            ? 'Statut du parrainage mis à jour'
            : 'Notification',
    description: item.message,
    timestamp: toRelativeTimestamp(item.createdAt),
    dateGroup: toDateGroup(item.createdAt),
    read: item.read,
    iconColor,
    bgColor,
  };
}

function toDateGroup(d: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notifDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - notifDate.getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  return 'Plus tôt';
}

function toRelativeTimestamp(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return `Hier à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
  return d.toLocaleDateString('fr-FR');
}

