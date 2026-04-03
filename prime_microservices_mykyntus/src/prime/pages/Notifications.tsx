import React, { useMemo } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useI18n } from '../contexts/I18nContext';
import { NotificationCenter, mapPrimeNotification } from '../components/notifications/NotificationCenter';

export function NotificationsPage() {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  const { t } = useI18n();

  const items = useMemo(
    () =>
      notifications.map((n) => {
        const label = t(`notifications.${n.type}`);
        return mapPrimeNotification({ ...n, label });
      }),
    [notifications, t],
  );

  return <NotificationCenter items={items} onMarkAllRead={markAllAsRead} onMarkRead={markAsRead} />;
}

