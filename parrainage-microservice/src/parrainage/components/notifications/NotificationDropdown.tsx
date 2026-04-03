import React from 'react';
import { NotificationService } from '../../services/notification.service';
import { mapReferralNotificationToCenter } from './NotificationCenter';
import type { RoleFilter } from '@parrainage/core/services/ReferralService';

interface Props {
  open: boolean;
  role: RoleFilter;
  user: { id: string; projectId?: string };
  onClose: () => void;
  onChanged?: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({ open, role, user, onClose, onChanged }) => {
  if (!open) return null;
  const notifications = NotificationService.getByRole(role, user).slice(0, 8).map(mapReferralNotificationToCenter);

  return (
    <div className="absolute right-0 top-12 z-50 w-96 card-navy">
      <div className="px-4 py-3 border-b border-navy-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Notifications</span>
        <button
          type="button"
          onClick={() => {
            NotificationService.markAllRead();
            onChanged?.();
          }}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
        >
          Tout lire
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-navy-800">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400 text-center">Aucune notification</div>
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
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => {
                      NotificationService.markRead(n.id);
                      onChanged?.();
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    Lu
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-4 py-3 border-t border-navy-800">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-blue-400 hover:text-blue-300 font-medium"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

