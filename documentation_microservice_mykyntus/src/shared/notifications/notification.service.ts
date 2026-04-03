import { ICONS } from '../../types';
import type { NotificationItem } from './notification.model';

const seed: NotificationItem[] = [
  {
    id: '1',
    type: 'documents',
    icon: ICONS.Check,
    title: 'Document request approved',
    description: 'Your request for "Employment Certificate" has been approved.',
    timestamp: '10 mins ago',
    dateGroup: 'Today',
    read: false,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: '2',
    type: 'documents',
    icon: ICONS.Documents,
    title: 'Document generated',
    description: 'Your "Salary Slip - Oct 2024" is ready to download.',
    timestamp: '2 hours ago',
    dateGroup: 'Today',
    read: false,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: '3',
    type: 'documents',
    icon: ICONS.X,
    title: 'Document request rejected',
    description: 'Your request for "Remote Work Agreement" was rejected. Please check the comments.',
    timestamp: 'Yesterday at 14:30',
    dateGroup: 'Yesterday',
    read: true,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    id: '4',
    type: 'system',
    icon: ICONS.Bell,
    title: 'HR announcement',
    description: 'Annual performance reviews will begin next week. Please prepare your self-assessment.',
    timestamp: 'Yesterday at 09:00',
    dateGroup: 'Yesterday',
    read: true,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: '5',
    type: 'system',
    icon: ICONS.Settings,
    title: 'System Maintenance',
    description: 'MyKyntus will be down for scheduled maintenance on Sunday from 02:00 to 04:00 AM.',
    timestamp: 'Oct 15, 2024',
    dateGroup: 'Earlier',
    read: true,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

let items: NotificationItem[] = [...seed];

export const NotificationService = {
  list(): NotificationItem[] {
    return items.map((n) => ({ ...n }));
  },
  unreadCount(): number {
    return items.filter((n) => !n.read).length;
  },
  markRead(id: string) {
    items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  },
  markAllRead() {
    items = items.map((n) => ({ ...n, read: true }));
  },
  remove(id: string) {
    items = items.filter((n) => n.id !== id);
  },
};

