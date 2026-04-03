import React, { useReducer } from 'react';
import { NotificationCenter } from '../shared/notifications/NotificationCenter';
import { NotificationService } from '../shared/notifications/notification.service';

export const Notifications: React.FC = () => {
  const [, refresh] = useReducer((x) => x + 1, 0);
  const notifications = NotificationService.list();

  return (
    <NotificationCenter
      items={notifications}
      onMarkAllRead={() => {
        NotificationService.markAllRead();
        refresh();
      }}
      onMarkRead={(id) => {
        NotificationService.markRead(id);
        refresh();
      }}
      onDelete={(id) => {
        NotificationService.remove(id);
        refresh();
      }}
    />
  );
};
