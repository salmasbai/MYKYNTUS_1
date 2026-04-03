import { NotificationPreferences } from '../models/settings.model';

const STORAGE_NOTIFICATION_PREFS = 'prime.settings.notification-prefs.v1';

const safeJsonParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const basePrefs: NotificationPreferences = {
  email: true,
  inApp: true,
  systemAlerts: false,
  referrals: true,
  approvals: true,
  payments: true,
};

export const SettingsService = {
  getNotificationPreferences(): NotificationPreferences {
    const raw = safeJsonParse<NotificationPreferences>(localStorage.getItem(STORAGE_NOTIFICATION_PREFS));
    return raw ? { ...basePrefs, ...raw } : { ...basePrefs };
  },

  updateNotificationPreferences(prefs: NotificationPreferences): void {
    localStorage.setItem(STORAGE_NOTIFICATION_PREFS, JSON.stringify({ ...this.getNotificationPreferences(), ...prefs }));
  },
};
