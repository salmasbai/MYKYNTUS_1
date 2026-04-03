import React from 'react';
import { Search, Sun, Moon, Bell, Settings } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../app/hooks/useAuth';
import { NotificationService } from '../../../src/parrainage/services/notification.service';
import { NotificationBadge } from '../../../src/parrainage/components/notifications/NotificationBadge';
import { NotificationDropdown } from '../../../src/parrainage/components/notifications/NotificationDropdown';
import { useNavigation } from '../../app/providers/NavigationProvider';
import { useAuditInterface } from '../../app/contexts/AuditInterfaceContext';

const VIEW_TITLES: Record<string, string> = {
  'pilote-dashboard': 'Tableau de bord',
  'pilote-submit': 'Soumettre un parrainage',
  'pilote-referrals': 'Suivi des parrainages',
  'pilote-bonus': 'Suivi des primes',
  'rh-dashboard': 'Pilotage parrainage (RH)',
  'rh-management': 'Gestion des parrainages',
  'rh-details': 'Détail du parrainage',
  'rh-rules': 'Règles de parrainage',
  'rh-history': 'Historique',
  settings: 'Paramètres',
  notifications: 'Notifications',
  'admin-dashboard': 'Centre opérationnel',
  'admin-tools': 'Outils administrateur',
  'admin-config': 'Configuration système',
  'admin-payments': 'Paiements',
  'admin-audit': 'Journal d\'audit',
  'pm-dashboard': 'Tableau de bord équipe',
  'pm-team': 'Membres de l\'équipe',
  'pm-referrals': 'Suivi des parrainages',
  'pm-performance': 'Performance de l\'équipe',
};

const AUDIT_SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard audit',
  journal: "Journal d'audit",
  'access-history': "Historique d'accès",
  anomalies: 'Anomalies',
  reporting: 'Reporting',
};

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentView, setCurrentView } = useNavigation();
  const { section } = useAuditInterface();
  const { user } = useAuth();
  const title =
    currentView === 'admin-audit'
      ? AUDIT_SECTION_TITLES[section] ?? "Journal d'audit"
      : VIEW_TITLES[currentView] ?? 'Parrainage';
  const role = user?.role ?? 'PILOTE';
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [, forceRefresh] = React.useReducer((x) => x + 1, 0);
  const unreadCount = user
    ? NotificationService.getUnreadCount(role, { id: user.id, projectId: user.projectId })
    : 0;

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-navy-950/80 backdrop-blur-md border-b border-navy-800 sticky top-0 z-40 transition-colors duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher…"
            className="bg-navy-900/50 border border-navy-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-64 transition-all placeholder:text-slate-600 shadow-inner"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-navy-800"
            title="Thème clair ou sombre"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-navy-800"
            >
              <Bell className="w-5 h-5" />
              <NotificationBadge count={unreadCount} />
            </button>
            {user && (
              <NotificationDropdown
                open={dropdownOpen}
                role={role}
                user={{ id: user.id, projectId: user.projectId }}
                onChanged={forceRefresh}
                onClose={() => {
                  setDropdownOpen(false);
                  setCurrentView('notifications');
                }}
              />
            )}
          </div>
          <button type="button" onClick={() => setCurrentView('settings')} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-navy-800">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-navy-800 mx-1" />
          <div className="flex items-center gap-3 pl-2 group">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-none group-hover:text-blue-400 transition-colors">Parrainage</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">MyKyntus</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.3)] border border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
              P
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
