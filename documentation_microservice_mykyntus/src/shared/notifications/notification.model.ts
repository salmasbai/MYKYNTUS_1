import type { ComponentType } from 'react';

export type NotificationKind = 'documents' | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationKind;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  timestamp: string;
  dateGroup: string;
  read: boolean;
  iconColor: string;
  bgColor: string;
}

export type NotificationFilter = 'all' | 'unread' | 'system' | 'documents';

