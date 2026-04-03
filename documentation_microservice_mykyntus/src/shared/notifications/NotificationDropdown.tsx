import React from 'react';
import { NotificationService } from './notification.service';

interface Props {
  open: boolean;
  onOpenAll: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({ open, onOpenAll }) => {
  if (!open) return null;
  const notifications = NotificationService.list().slice(0, 6);

  return (
    <div className="absolute right-0 top-12 z-50 w-96 card-navy">
      <div className="px-4 py-3 border-b border-navy-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Notifications</span>
        <button
          type="button"
          onClick={() => NotificationService.markAllRead()}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-navy-800">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400 text-center">No notifications</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="px-4 py-3 hover:bg-navy-800/50">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.bgColor}`}>
                  <n.icon className={`w-4 h-4 ${n.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-slate-300' : 'text-white font-medium'}`}>{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.description}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{n.timestamp}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-4 py-3 border-t border-navy-800">
        <button type="button" onClick={onOpenAll} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
          Open notification center
        </button>
      </div>
    </div>
  );
};

