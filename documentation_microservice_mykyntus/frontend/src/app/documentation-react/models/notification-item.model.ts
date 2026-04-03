export type NotificationFilter = 'all' | 'unread' | 'system' | 'documents';

export type NotificationKind = 'documents' | 'system';

export type NotificationIconKey =
  | 'check-circle-2'
  | 'file-text'
  | 'x-circle'
  | 'bell'
  | 'settings';

export interface NotificationItemUi {
  id: string;
  type: NotificationKind;
  icon: NotificationIconKey;
  title: string;
  description: string;
  timestamp: string;
  dateGroup: string;
  read: boolean;
  iconColor: string;
  bgColor: string;
}
