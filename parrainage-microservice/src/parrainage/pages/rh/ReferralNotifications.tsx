import React, { useEffect, useMemo, useState } from 'react';
import { ReferralService } from '../../services/ReferralService';
import type { ReferralNotification } from '../../models/Referral';
import { NotificationCenter, mapReferralNotificationToCenter } from '../../components/notifications/NotificationCenter';

export const ReferralNotifications: React.FC = () => {
  const [rawNotifications, setRawNotifications] = useState<ReferralNotification[]>([]);

  useEffect(() => {
    setRawNotifications(ReferralService.getNotifications());
  }, []);

  const notifications = useMemo(
    () => rawNotifications.map(mapReferralNotificationToCenter),
    [rawNotifications],
  );

  const refresh = () => setRawNotifications(ReferralService.getNotifications());

  const handleMarkAllRead = () => {
    ReferralService.markAllNotificationsAsRead();
    refresh();
  };

  const handleMarkRead = (id: string) => {
    ReferralService.markNotificationAsRead(id);
    refresh();
  };

  return (
    <NotificationCenter
      title="Notifications"
      unreadLabel="Non lues"
      markAllLabel="Tout marquer comme lu"
      emptyTitle="Aucune notification"
      emptyDescription="Vous êtes à jour !"
      items={notifications}
      onMarkAllRead={handleMarkAllRead}
      onMarkRead={handleMarkRead}
      actionLabel="Voir les parrainages"
      filters={['all', 'unread', 'documents', 'system']}
    />
  );
};
