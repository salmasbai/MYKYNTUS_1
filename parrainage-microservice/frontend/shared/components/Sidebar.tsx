import React from 'react';
import {
  ChevronLeft,
  Menu,
  FileText,
  LayoutDashboard,
  ScrollText,
  Shield,
  AlertTriangle,
  BarChart3,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth, type Role } from '../../app/hooks/useAuth';
import { ParrainageView, useNavigation } from '../../app/providers/NavigationProvider';
import { type AuditInterfaceSectionId, useAuditInterface } from '../../app/contexts/AuditInterfaceContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

type AuditNavTone = 'emerald' | 'blue' | 'cyan' | 'amber' | 'violet';

const AUDIT_NAV_TONE_ACTIVE: Record<AuditNavTone, string> = {
  emerald:
    'border-emerald-500/50 ring-emerald-500/30 bg-emerald-600/15 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.2)]',
  blue: 'border-blue-500/50 ring-blue-500/30 bg-blue-600/15 text-blue-300 shadow-[0_0_14px_rgba(37,99,235,0.18)]',
  cyan: 'border-cyan-500/50 ring-cyan-500/30 bg-cyan-600/15 text-cyan-300 shadow-[0_0_14px_rgba(6,182,212,0.18)]',
  amber:
    'border-amber-500/50 ring-amber-500/30 bg-amber-600/15 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.18)]',
  violet:
    'border-violet-500/50 ring-violet-500/30 bg-violet-600/15 text-violet-200 shadow-[0_0_14px_rgba(139,92,246,0.2)]',
};

const ROLE_DASHBOARDS: Partial<Record<Role, ParrainageView>> = {
  PILOTE: 'pilote-dashboard',
  RH: 'rh-dashboard',
  ADMIN: 'admin-dashboard',
  MANAGER: 'pm-dashboard',
  COACH: 'pm-dashboard',
  RP: 'pm-dashboard',
  AUDIT: 'admin-audit',
};

const RH_ITEMS: Array<{ to: ParrainageView; label: string }> = [
  { to: 'rh-dashboard', label: 'Tableau de bord' },
  { to: 'rh-management', label: 'Gestion des parrainages' },
  { to: 'rh-rules', label: 'Règles de parrainage' },
  { to: 'rh-history', label: 'Historique' },
  { to: 'notifications', label: 'Notifications' },
  { to: 'settings', label: 'Paramètres' },
  { to: 'admin-config', label: 'Configuration système' },
];

const PILOTE_ITEMS: Array<{ to: ParrainageView; label: string }> = [
  { to: 'pilote-dashboard', label: 'Tableau de bord' },
  { to: 'pilote-submit', label: 'Soumettre un parrainage' },
  { to: 'pilote-referrals', label: 'Suivi des parrainages' },
  { to: 'pilote-bonus', label: 'Suivi des primes' },
  { to: 'notifications', label: 'Notifications' },
  { to: 'settings', label: 'Paramètres' },
];

const ADMIN_ITEMS: Array<{ to: ParrainageView; label: string }> = [
  { to: 'admin-dashboard', label: 'Centre opérationnel' },
  { to: 'admin-tools', label: 'Outils administrateur' },
  { to: 'admin-workflow', label: 'Configuration du flux' },
  { to: 'admin-config', label: 'Configuration système' },
  { to: 'admin-payments', label: 'Paiements' },
  { to: 'notifications', label: 'Notifications' },
  { to: 'settings', label: 'Paramètres' },
  { to: 'admin-audit', label: "Journal d'audit" },
];

const PM_ITEMS: Array<{ to: ParrainageView; label: string }> = [
  { to: 'pm-dashboard', label: "Tableau de bord équipe" },
  { to: 'pm-team', label: "Membres de l'équipe" },
  { to: 'pm-referrals', label: 'Parrainages' },
  { to: 'pm-performance', label: 'Performance' },
  { to: 'notifications', label: 'Notifications' },
  { to: 'settings', label: 'Paramètres' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user, loginAsRole } = useAuth();
  const { currentView, setCurrentView } = useNavigation();
  const { section, setSection } = useAuditInterface();

  const currentRole = user?.role ?? 'PILOTE';

  const handleRoleChange = (role: Role) => {
    loginAsRole(role);
    setCurrentView(ROLE_DASHBOARDS[role] ?? 'pilote-dashboard');
  };

  const navItems =
    currentRole === 'RH'
      ? RH_ITEMS
      : currentRole === 'ADMIN'
        ? ADMIN_ITEMS
        : currentRole === 'MANAGER' || currentRole === 'COACH' || currentRole === 'RP'
          ? PM_ITEMS
          : currentRole === 'AUDIT'
            ? null
            : PILOTE_ITEMS;

  const roleLabels: Record<string, string> = {
    RH: 'RH',
    PILOTE: 'Pilote',
    ADMIN: 'Administrateur',
    COACH: 'Coach',
    MANAGER: 'Manager',
    RP: 'Responsable projet',
    AUDIT: 'Audit',
  };
  const roleLabel = roleLabels[currentRole] ?? currentRole;

  const auditNavItems: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: AuditNavTone;
    isActive: (v: ParrainageView, s: AuditInterfaceSectionId) => boolean;
    onSelect: () => void;
  }> = [
    {
      key: 'dash',
      label: 'Dashboard audit',
      icon: LayoutDashboard,
      tone: 'emerald',
      isActive: (v, s) => v === 'admin-audit' && s === 'dashboard',
      onSelect: () => {
        setSection('dashboard');
        setCurrentView('admin-audit');
      },
    },
    {
      key: 'journal',
      label: 'Journal d’audit',
      icon: ScrollText,
      tone: 'blue',
      isActive: (v, s) => v === 'admin-audit' && s === 'journal',
      onSelect: () => {
        setSection('journal');
        setCurrentView('admin-audit');
      },
    },
    {
      key: 'access',
      label: 'Historique d’accès',
      icon: Shield,
      tone: 'cyan',
      isActive: (v, s) => v === 'admin-audit' && s === 'access-history',
      onSelect: () => {
        setSection('access-history');
        setCurrentView('admin-audit');
      },
    },
    {
      key: 'anom',
      label: 'Anomalies',
      icon: AlertTriangle,
      tone: 'amber',
      isActive: (v, s) => v === 'admin-audit' && s === 'anomalies',
      onSelect: () => {
        setSection('anomalies');
        setCurrentView('admin-audit');
      },
    },
    {
      key: 'report',
      label: 'Reporting',
      icon: BarChart3,
      tone: 'violet',
      isActive: (v, s) => v === 'admin-audit' && s === 'reporting',
      onSelect: () => {
        setSection('reporting');
        setCurrentView('admin-audit');
      },
    },
  ];

  const auditSecondaryNav: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: (v: ParrainageView) => boolean;
    onSelect: () => void;
  }> = [
    {
      key: 'notif',
      label: 'Notifications',
      icon: Bell,
      isActive: (v) => v === 'notifications',
      onSelect: () => setCurrentView('notifications'),
    },
    {
      key: 'sett',
      label: 'Paramètres',
      icon: SlidersHorizontal,
      isActive: (v) => v === 'settings',
      onSelect: () => setCurrentView('settings'),
    },
  ];

  return (
    <div
      className={`h-screen bg-navy-900 border-r border-navy-800 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-[70px]' : 'w-64'
      }`}
    >
      <div
        className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]">
              <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">MyKyntus</h1>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors shrink-0"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4 mt-4">
        {currentRole === 'AUDIT' && (
          <div className="space-y-1">
            {auditNavItems.map((item) => {
              const active = item.isActive(currentView, section);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onSelect}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 border ${
                    active
                      ? `ring-1 ${AUDIT_NAV_TONE_ACTIVE[item.tone]}`
                      : 'border-transparent text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${active ? '' : 'opacity-80'}`} />
                  {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                </button>
              );
            })}
            <div className="pt-3 mt-2 border-t border-navy-800 space-y-1">
              {auditSecondaryNav.map((item) => {
                const active = item.isActive(currentView);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={item.onSelect}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 ring-1 ring-blue-500/30'
                        : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {navItems &&
          navItems.map((item) => {
            const active = currentView === item.to;
            return (
              <button
                key={`${item.to}-${item.label}`}
                type="button"
                onClick={() => setCurrentView(item.to)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 ring-1 ring-blue-500/30 shadow-[0_0_14px_rgba(37,99,235,0.18)]'
                    : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                }`}
              >
                {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                {isCollapsed && <span className="text-xs font-medium">{item.label[0]}</span>}
              </button>
            );
          })}
      </nav>

      <div className={`p-4 border-t border-navy-800 ${isCollapsed ? 'flex flex-col items-stretch gap-2' : ''}`}>
        {!isCollapsed && (
          <div className="card-navy p-4 md:p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-50">Rôle (démo)</h3>
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="w-full rounded-lg border border-navy-800 bg-navy-900 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer transition-colors"
            >
              <option value="PILOTE">Pilote</option>
              <option value="COACH">Coach</option>
              <option value="MANAGER">Manager</option>
              <option value="RP">Responsable projet</option>
              <option value="RH">RH</option>
              <option value="ADMIN">Administrateur</option>
              <option value="AUDIT">Audit</option>
            </select>
            <p className="text-xs text-slate-400">
              Rôle actuel :{' '}
              <span className="font-medium text-slate-200">{roleLabel}</span>
            </p>
          </div>
        )}
        {isCollapsed && (
          <div className="card-navy p-2 space-y-2">
            <p className="text-[9px] uppercase tracking-wide text-slate-500 text-center leading-tight">
              Rôle
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {(
                [
                  { code: 'PILOTE' as const, short: 'Pl', title: 'Pilote' },
                  { code: 'COACH' as const, short: 'Co', title: 'Coach' },
                  { code: 'MANAGER' as const, short: 'Mg', title: 'Manager' },
                  { code: 'RP' as const, short: 'RP', title: 'RP' },
                  { code: 'RH' as const, short: 'RH', title: 'RH' },
                  { code: 'ADMIN' as const, short: 'Ad', title: 'Administrateur' },
                  { code: 'AUDIT' as const, short: 'Au', title: 'Audit' },
                ] as const
              ).map(({ code, short, title }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleRoleChange(code)}
                  className={`min-w-[1.75rem] rounded-lg border px-1.5 py-1.5 text-[9px] font-medium transition-colors ${
                    code === currentRole
                      ? 'border-blue-500/40 bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/30 shadow-[0_0_10px_rgba(37,99,235,0.12)]'
                      : 'border-navy-800 bg-navy-900/60 text-slate-400 hover:border-navy-700 hover:bg-navy-800/40 hover:text-slate-200'
                  }`}
                  title={title}
                >
                  {short}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
