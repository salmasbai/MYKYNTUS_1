import { useNotifications } from '../contexts/NotificationContext';
import { useI18n } from '../contexts/I18nContext';

export function NotificationDropdown() {
  const { notifications, dropdownOpen, markAllAsRead, markAsRead } = useNotifications();
  const { t } = useI18n();

  if (!dropdownOpen) return null;

  return (
    <div className="absolute right-4 top-14 z-30 w-80 card-navy">
      <div className="px-4 py-3 border-b border-navy-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {t('topbar.notifications')}
        </span>
        <button
          onClick={markAllAsRead}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400 text-center">
            No notifications
          </div>
        ) : (
          <ul className="divide-y divide-navy-800">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="px-4 py-3 flex items-start gap-2 hover:bg-navy-800"
              >
                <span
                  className={`mt-1 w-2 h-2 rounded-full ${
                    n.read ? 'bg-slate-300' : 'bg-emerald-500'
                  }`}
                />
                <div>
                  <p className="text-sm text-slate-200">
                    {t(`notifications.${n.type}`)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {n.createdAt.toLocaleString()}
                  </p>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className="mt-1 text-[11px] text-blue-400 hover:text-blue-300"
                    >
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

