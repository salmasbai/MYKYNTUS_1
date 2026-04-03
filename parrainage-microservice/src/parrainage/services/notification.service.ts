import { ReferralService } from '../services/ReferralService';
import { mapReferralNotificationToCenter, type NotificationCenterItem } from '../components/notifications/NotificationCenter';
import type { RoleFilter } from '@parrainage/core/services/ReferralService';

export const NotificationService = {
  getByRole(role: RoleFilter, user: { id: string; projectId?: string }) {
    return ReferralService.getNotificationsForRole(role, user);
  },

  getCenterItems(role: RoleFilter, user: { id: string; projectId?: string }): NotificationCenterItem[] {
    return this.getByRole(role, user).map(mapReferralNotificationToCenter);
  },

  getUnreadCount(role: RoleFilter, user: { id: string; projectId?: string }): number {
    return this.getByRole(role, user).filter((n) => !n.read).length;
  },

  markRead(id: string) {
    ReferralService.markNotificationAsRead(id);
  },

  markAllRead() {
    ReferralService.markAllNotificationsAsRead();
  },

  getPreferences() {
    return ReferralService.getNotificationPreferences();
  },
};

