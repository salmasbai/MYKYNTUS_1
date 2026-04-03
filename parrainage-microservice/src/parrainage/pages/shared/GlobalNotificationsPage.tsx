import React, { useMemo, useState } from 'react';
import type { ReferralNotification } from '@parrainage/core/models/Referral';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { NotificationCenter, mapReferralNotificationToCenter } from '../../components/notifications/NotificationCenter';
import { NotificationService } from '../../services/notification.service';

function applyPrefs(list: ReferralNotification[], prefs: ReturnType<typeof NotificationService.getPreferences>): ReferralNotification[] {
  return list.filter((n) => {
    if (n.type === 'NEW_REFERRAL' && prefs.referrals === false) return false;
    if (n.type === 'STATUS_CHANGED' && prefs.approvals === false) return false;
    if (n.type === 'REFERRAL_REWARDED' && prefs.payments === false) return false;
    return true;
  });
}

export const GlobalNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const role = user?.role ?? 'PILOTE';

  const prefs = NotificationService.getPreferences();
  const raw = useMemo(() => {
    if (!user) return [];
    return NotificationService.getByRole(role, { id: user.id, projectId: user.projectId });
  }, [user, role, tick]);

  const list = useMemo(() => applyPrefs(raw, prefs), [raw, prefs]);

  const markRead = (id: string) => {
    NotificationService.markRead(id);
    setTick((t) => t + 1);
  };

  const markAll = () => {
    NotificationService.markAllRead();
    setTick((t) => t + 1);
  };

  const mapped = useMemo(() => list.map(mapReferralNotificationToCenter), [list]);

  return (
    <NotificationCenter
      title="Notifications"
      unreadLabel="Non lues"
      markAllLabel="Tout marquer comme lu"
      emptyTitle="Aucune notification"
      emptyDescription="Aucune notification pour ce périmètre."
      items={mapped}
      onMarkAllRead={markAll}
      onMarkRead={markRead}
    />
  );
};
