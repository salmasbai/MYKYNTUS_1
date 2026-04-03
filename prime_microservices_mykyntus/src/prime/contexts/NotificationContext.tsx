import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { PrimeNotificationService } from '../services/notification.service';

export type PrimeNotificationType =
  | 'primeValidated'
  | 'primeRejected'
  | 'newPrimeRule'
  | 'teamPerformanceUpdated';

export interface PrimeNotification {
  id: number;
  type: PrimeNotificationType;
  createdAt: Date;
  read: boolean;
}

interface NotificationContextValue {
  notifications: PrimeNotification[];
  unreadCount: number;
  dropdownOpen: boolean;
  settingsOpen: boolean;
  push: (type: PrimeNotificationType) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  toggleDropdown: () => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<PrimeNotification[]>(PrimeNotificationService.seed());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const unreadCount = useMemo(
    () => PrimeNotificationService.unreadCount(notifications),
    [notifications],
  );

  const push = (type: PrimeNotificationType) => {
    setNotifications((prev) => PrimeNotificationService.push(prev, type));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => PrimeNotificationService.markAllAsRead(prev));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) => PrimeNotificationService.markAsRead(prev, id));
  };

  const toggleDropdown = () => setDropdownOpen((o) => !o);
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        dropdownOpen,
        settingsOpen,
        push,
        markAsRead,
        markAllAsRead,
        toggleDropdown,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}

