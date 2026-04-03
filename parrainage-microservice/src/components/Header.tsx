import React from 'react';
import { ICONS } from '../types';
import { useAppContext } from '../i18n/appContext';

interface HeaderProps {
  title: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, setActiveTab }) => {
  const { theme, toggleTheme, t } = useAppContext();

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-navy-950/80 backdrop-blur-md border-b border-navy-800 sticky top-0 z-40 transition-colors duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">
          Programme de parrainage des collaborateurs MyKyntus.
        </p>
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
            title="Changer de thème"
          >
            {theme === 'dark' ? <ICONS.Sun className="w-5 h-5" /> : <ICONS.Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-navy-800"
          >
            <ICONS.Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-navy-800"
          >
            <ICONS.Settings className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-navy-800 mx-1" />
          <button className="flex items-center gap-3 pl-2 group">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-none group-hover:text-blue-400 transition-colors">
                Collaborateur Démo
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">user@mykyntus.com</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-electric-blue flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.3)] border border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
              P6
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

