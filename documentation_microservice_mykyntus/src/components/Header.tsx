import React from 'react';
import { ICONS } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { NotificationBadge } from '../shared/notifications/NotificationBadge';
import { NotificationDropdown } from '../shared/notifications/NotificationDropdown';
import { NotificationService } from '../shared/notifications/notification.service';

interface HeaderProps {
  title: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, setActiveTab }) => {
  const { theme, toggleTheme, t } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const [, refresh] = React.useReducer((x) => x + 1, 0);
  const unreadCount = NotificationService.unreadCount();

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-navy-950/80 backdrop-blur-md border-b border-navy-800 sticky top-0 z-40 transition-colors duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder={t('header.search')}
            className="bg-navy-900/50 border border-navy-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-64 transition-all placeholder:text-slate-600 shadow-inner"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-navy-800"
            title="Basculer le thème clair ou sombre"
          >
            {theme === 'dark' ? <ICONS.Sun className="w-5 h-5" /> : <ICONS.Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setOpen((v) => !v);
                refresh();
              }}
              className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-navy-800"
            >
              <ICONS.Bell className="w-5 h-5" />
              <NotificationBadge count={unreadCount} />
            </button>
            <NotificationDropdown
              open={open}
              onOpenAll={() => {
                setOpen(false);
                setActiveTab('notifications');
              }}
            />
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-navy-800"
          >
            <ICONS.Settings className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-navy-800 mx-1"></div>
          <button className="flex items-center gap-3 pl-2 group">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-none group-hover:text-blue-400 transition-colors">Salma E.</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">salmaessbaikyntus@gmail.com</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-electric-blue flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.3)] border border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
              SE
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
