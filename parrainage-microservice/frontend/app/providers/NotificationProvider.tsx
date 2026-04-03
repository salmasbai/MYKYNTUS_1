import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface NotificationContextValue {
  notify: (type: ToastType, message: string) => void;
  Toaster: React.FC;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = (type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const Toaster: React.FC = () => (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`card-navy px-4 py-2 text-sm border-l-4 ${
            t.type === 'success'
              ? 'border-emerald-500'
              : t.type === 'error'
              ? 'border-red-500'
              : 'border-soft-blue'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );

  return (
    <NotificationContext.Provider value={{ notify, Toaster }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification doit être utilisé dans un NotificationProvider');
  return ctx;
};

