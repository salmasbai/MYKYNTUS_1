import { useRole } from '../contexts/RoleContext';
import { PRIME_AUTHORIZED_ROLES, Role } from '../models';
import { Shield, Search, Bell, Moon, Sun, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationBadge } from './notifications/NotificationBadge';

export function Topbar() {
  const { currentRole, setRole } = useRole();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const { unreadCount, toggleDropdown, openSettings } = useNotifications();

  // Seuls les rôles autorisés peuvent sélectionner et accéder au module PRIME
  const roles: Role[] = ['Admin', 'RH', 'RP', 'Manager', 'Coach', 'Pilote', 'Audit'].filter((r) =>
    PRIME_AUTHORIZED_ROLES.includes(r),
  ) as Role[];
  const roleLabel: Record<Role, string> = {
    Admin: 'Administrateur',
    RH: 'RH',
    RP: 'RP',
    Manager: 'Manager',
    Coach: 'Coach',
    Pilote: 'Pilote',
    Audit: 'Audit',
  };

  return (
    <header className="h-16 glass flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('topbar.search.placeholder')} 
            className="w-full pl-9 pr-4 py-2 bg-navy-900/50 border border-navy-800 rounded-full text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          onClick={toggleTheme}
          aria-label="Basculer le thème clair ou sombre"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 text-slate-300 hover:text-white transition-colors"
            onClick={toggleDropdown}
          >
            <Bell className="w-5 h-5" />
            <NotificationBadge count={unreadCount} />
          </button>
          <NotificationDropdown />
        </div>

        {/* Settings */}
        <button
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          onClick={openSettings}
          aria-label="Ouvrir les paramètres"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-navy-800 mx-1"></div>
        <div className="flex items-center gap-2 bg-navy-900/70 border border-navy-800 rounded-lg px-3 py-1.5">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-300 hidden sm:inline">
            {t('topbar.role.label')}:
          </span>
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-transparent text-sm font-semibold text-blue-400 focus:outline-none cursor-pointer"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabel[role]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
