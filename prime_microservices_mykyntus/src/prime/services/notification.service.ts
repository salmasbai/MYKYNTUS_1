import type { PrimeNotification, PrimeNotificationType } from '../contexts/NotificationContext';

export const PrimeNotificationService = {
  seed(): PrimeNotification[] {
    return [
      { id: 1, type: 'primeValidated', createdAt: new Date(), read: false },
      { id: 2, type: 'newPrimeRule', createdAt: new Date(), read: false },
    ];
  },

  push(prev: PrimeNotification[], type: PrimeNotificationType): PrimeNotification[] {
    const nextId = prev.length ? prev[0].id + 1 : 1;
    return [{ id: nextId, type, createdAt: new Date(), read: false }, ...prev];
  },

  markAllAsRead(prev: PrimeNotification[]): PrimeNotification[] {
    return prev.map((n) => ({ ...n, read: true }));
  },

  markAsRead(prev: PrimeNotification[], id: number): PrimeNotification[] {
    return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
  },

  unreadCount(prev: PrimeNotification[]): number {
    return prev.filter((n) => !n.read).length;
  },
};

