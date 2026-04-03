import { Injectable } from '@angular/core';

import type { NotificationPreferences } from '../models/notification-preferences.model';

const STORAGE_NOTIFICATION_PREFS = 'documentation.settings.notification-prefs.v1';

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const basePrefs: NotificationPreferences = {
  email: true,
  inApp: true,
  systemAlerts: false,
  referrals: true,
  approvals: true,
  payments: true,
};

@Injectable({ providedIn: 'root' })
export class SettingsStorageService {
  getNotificationPreferences(): NotificationPreferences {
    const raw = safeJsonParse<NotificationPreferences>(
      typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_NOTIFICATION_PREFS) : null,
    );
    return raw ? { ...basePrefs, ...raw } : { ...basePrefs };
  }

  updateNotificationPreferences(prefs: NotificationPreferences): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      STORAGE_NOTIFICATION_PREFS,
      JSON.stringify({ ...this.getNotificationPreferences(), ...prefs }),
    );
  }
}
