import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, Settings, XCircle } from 'lucide-react';

export type NotificationFilter = 'all' | 'unread' | 'documents' | 'system';

export interface NotificationItemVm {
  id: number;
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

interface Props {
  items: NotificationItemVm[];
  onMarkAllRead: () => void;
  onMarkRead: (id: number) => void;
}

export function NotificationCenter({ items, onMarkAllRead, onMarkRead }: Props) {
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.read;
      return n.type === filter;
    });
  }, [items, filter]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, n) => {
      if (!acc[n.dateGroup]) acc[n.dateGroup] = [];
      acc[n.dateGroup].push(n);
      return acc;
    }, {} as Record<string, NotificationItemVm[]>);
  }, [filtered]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-8 bg-app min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-primary">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              {unreadCount} Non lues
            </span>
          )}
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Tout marquer comme lu
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
                : 'bg-card text-muted hover:bg-app hover:text-primary border border-default'
            }`}
          >
            {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : f === 'documents' ? 'Métier' : 'Système'}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {(Object.entries(grouped) as [string, NotificationItemVm[]][]).map(([group, groupItems]) => (
          <div key={group} className="space-y-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest">{group}</h3>
            <div className="space-y-3">
              {groupItems.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-card border border-default rounded-xl p-4 flex items-start gap-4 group cursor-pointer ${
                    !notification.read ? 'border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.bgColor}`}>
                    <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-bold truncate ${!notification.read ? 'text-primary' : 'text-muted'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted whitespace-nowrap shrink-0">
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted line-clamp-2">{notification.description}</p>
                    {!notification.read && (
                      <div className="mt-3">
                        <button
                          className="text-xs font-medium text-slate-400 hover:text-primary transition-colors"
                          onClick={() => onMarkRead(notification.id)}
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-card border border-default rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">Aucune notification</h3>
            <p className="text-muted">Vous êtes à jour !</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function mapPrimeNotification(item: {
  id: number;
  type: string;
  createdAt: Date;
  read: boolean;
  label: string;
}): NotificationItemVm {
  const statusByType: Record<string, { kind: 'documents' | 'system'; color: string; bg: string; icon: NotificationItemVm['icon'] }> = {
    primeValidated: { kind: 'documents', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
    primeRejected: { kind: 'documents', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
    newPrimeRule: { kind: 'system', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Settings },
    teamPerformanceUpdated: { kind: 'system', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Bell },
  };
  const style = statusByType[item.type] ?? statusByType.teamPerformanceUpdated;
  return {
    id: item.id,
    type: style.kind,
    title: item.label,
    description: item.label,
    timestamp: item.createdAt.toLocaleString(),
    dateGroup: toDateGroup(item.createdAt),
    read: item.read,
    icon: style.icon,
    iconColor: style.color,
    bgColor: style.bg,
  };
}

function toDateGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.floor((today.getTime() - current.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return 'Plus tôt';
}

