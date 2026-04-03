import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  List,
  Settings,
  CheckCircle,
  History,
  SlidersHorizontal,
  Users,
  Activity,
  BarChart,
  BarChart3,
  Bell,
  UserCircle2,
  Award,
  Shield,
  Workflow,
  AlertCircle,
  ScrollText,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '../contexts/RoleContext';
import { Topbar } from './Topbar';
import { PRIME_AUTHORIZED_ROLES, Role } from '../models';
import { useI18n } from '../contexts/I18nContext';
import { SettingsPanel } from './SettingsPanel';
import { AccessDenied } from '../pages/AccessDenied';
import { Dashboard } from '../pages/Dashboard';
import { PrimeTypes } from '../pages/PrimeTypes';
import { PrimeRules } from '../pages/PrimeRules';
import { PrimeResults } from '../pages/PrimeResults';
import { PrimeValidation } from '../pages/PrimeValidation';
import { PrimeHistory } from '../pages/PrimeHistory';
import { TeamPerformance } from '../pages/TeamPerformance';
import { ActivityInput } from '../pages/ActivityInput';
import { PrimeConfiguration } from '../pages/PrimeConfiguration';
import { NotificationsPage } from '../pages/Notifications';
import { SettingsPage } from '../pages/Settings';
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard';
import { MyPrimes } from '../pages/employee/MyPrimes';
import { MyPerformance } from '../pages/employee/MyPerformance';
import { AdminSection, RpSection, AuditSection, usePrimeSection } from '../contexts/PrimeSectionContext';

const navItems: { name: string; path: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { name: 'Tableau de bord', path: '/', icon: LayoutDashboard, roles: ['Admin', 'RH', 'RP', 'Manager', 'Coach'] },
  { name: 'Types de prime', path: '/types', icon: List, roles: ['Admin', 'RH'] },
  { name: 'Règles', path: '/rules', icon: Settings, roles: ['Admin', 'RH'] },
  { name: 'Résultats', path: '/results', icon: Users, roles: ['Admin', 'RH', 'RP', 'Manager', 'Coach'] },
  { name: 'Validation', path: '/validation', icon: CheckCircle, roles: ['Admin', 'RH', 'RP', 'Manager', 'Coach'] },
  { name: 'Historique', path: '/history', icon: History, roles: ['Admin', 'RH', 'RP'] },
  { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['Admin', 'RH', 'RP', 'Manager', 'Coach', 'Pilote', 'Audit'] },
  { name: 'Paramètres', path: '/settings', icon: SlidersHorizontal, roles: ['Admin', 'RH', 'RP', 'Manager', 'Coach', 'Pilote', 'Audit'] },
  { name: 'Performance équipe', path: '/team-performance', icon: BarChart3, roles: ['Manager', 'Coach'] },
  { name: 'Saisie d’activité', path: '/activity-input', icon: Activity, roles: ['Manager', 'Coach'] },
  { name: 'Configuration', path: '/configuration', icon: SlidersHorizontal, roles: ['Admin'] },
  { name: 'Mon tableau de bord', path: '/employee/dashboard', icon: UserCircle2, roles: ['Pilote'] },
  { name: 'Mes primes', path: '/employee/primes', icon: Award, roles: ['Pilote'] },
  { name: 'Ma performance', path: '/employee/performance', icon: BarChart3, roles: ['Pilote'] },
];

const rpNavItems: Array<{ id: RpSection; name: string; icon: any; roles: Role[] }> = [
  { id: 'dashboard', name: 'Tableau de bord', icon: LayoutDashboard, roles: ['RP'] },
  { id: 'performance', name: 'Performance équipe', icon: BarChart3, roles: ['RP'] },
  { id: 'validation', name: 'Validation finale', icon: CheckCircle, roles: ['RP'] },
  { id: 'suivi-projet', name: 'Suivi projet', icon: Activity, roles: ['RP'] },
  { id: 'notifications' as RpSection, name: 'Notifications', icon: Bell, roles: ['RP'] },
  { id: 'settings' as RpSection, name: 'Paramètres', icon: SlidersHorizontal, roles: ['RP'] },
];

const adminNavItems: Array<{ id: AdminSection; name: string; icon: any; roles: Role[] }> = [
  { id: 'dashboard', name: 'Dashboard système', icon: LayoutDashboard, roles: ['Admin'] },
  { id: 'engine', name: 'Moteur de calcul', icon: SlidersHorizontal, roles: ['Admin'] },
  { id: 'access', name: 'Gestion des accès', icon: Shield, roles: ['Admin'] },
  { id: 'workflows', name: 'Configuration du flux', icon: Workflow, roles: ['Admin'] },
  { id: 'logs', name: 'Supervision & logs', icon: History, roles: ['Admin'] },
  { id: 'anomalies', name: 'Anomalies', icon: AlertCircle, roles: ['Admin'] },
  { id: 'notifications' as AdminSection, name: 'Notifications', icon: Bell, roles: ['Admin'] },
  { id: 'settings' as AdminSection, name: 'Paramètres', icon: SlidersHorizontal, roles: ['Admin'] },
];

const auditNavItems: Array<{ id: AuditSection; name: string; icon: typeof LayoutDashboard }> = [
  { id: 'journal', name: 'Journal d’audit', icon: ScrollText },
  { id: 'access-history', name: 'Historique d’accès', icon: Shield },
  { id: 'anomalies', name: 'Anomalies', icon: AlertTriangle },
  { id: 'reporting', name: 'Reporting', icon: BarChart },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'settings', name: 'Paramètres', icon: SlidersHorizontal },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

export function Sidebar({ collapsed, onToggleCollapsed, currentView, onChangeView }: SidebarProps) {
  const { currentRole } = useRole();
  const { t } = useI18n();
  const { activeRpSection, activeAdminSection, activeAuditSection, setActiveRpSection, setActiveAdminSection, setActiveAuditSection } = usePrimeSection();
  const rpVisibleItems = rpNavItems.filter((item) => item.roles.includes(currentRole));
  const adminVisibleItems = adminNavItems.filter((item) => item.roles.includes(currentRole));
  const visibleItems = (currentRole === 'RP' || currentRole === 'Admin' || currentRole === 'Audit')
    ? null
    : navItems.filter((item) => item.roles.includes(currentRole));

  const renderButtonItem = (item: any) => {
    const isActive =
      currentRole === 'RP'
        ? activeRpSection === item.id
        : currentRole === 'Admin'
          ? activeAdminSection === item.id
          : false;

    const onClick = () => {
      if (currentRole === 'RP') setActiveRpSection(item.id as RpSection);
      if (currentRole === 'Admin') setActiveAdminSection(item.id as AdminSection);
    };

    return (
      <button
        key={item.name}
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2 text-left',
          isActive ? 'bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/30 border border-blue-500/35 shadow-[0_0_14px_rgba(37,99,235,0.18)]' : 'text-muted hover:bg-card hover:text-primary',
        )}
      >
        <item.icon className={cn('w-5 h-5', 'transition-colors')} />
        {!collapsed && <span>{item.name}</span>}
      </button>
    );
  };

  const renderAuditNavButton = (item: { id: AuditSection; name: string; icon: typeof LayoutDashboard }) => {
    const isActive = activeAuditSection === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setActiveAuditSection(item.id)}
        title={collapsed ? item.name : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2 text-left',
          isActive ? 'bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/30 border border-blue-500/35 shadow-[0_0_14px_rgba(37,99,235,0.18)]' : 'text-muted hover:bg-card hover:text-primary',
        )}
      >
        <item.icon className={cn('w-5 h-5 shrink-0 transition-colors')} />
        {!collapsed && <span>{item.name}</span>}
      </button>
    );
  };

  return (
    <aside
      className={cn(
        'bg-sidebar border-r border-default h-screen flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-default">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          {!collapsed && (
            <span className="text-primary font-bold text-lg tracking-tight">
              PRIME
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapsed}
          className="text-muted hover:text-primary text-xs px-1 py-1 rounded-md hover:bg-card"
          aria-label="Réduire ou agrandir le menu"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <div className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2 mb-3 text-xs font-semibold text-muted uppercase tracking-wider">
            {t('layout.menu')}
          </div>
        )}
        {currentRole === 'RP' && rpVisibleItems.map(renderButtonItem)}
        {currentRole === 'Admin' && adminVisibleItems.map(renderButtonItem)}
        {currentRole === 'Audit' && auditNavItems.map(renderAuditNavButton)}
        {visibleItems?.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onChangeView(item.path)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2 text-left',
              currentView === item.path ? 'bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/30 border border-blue-500/35 shadow-[0_0_14px_rgba(37,99,235,0.18)]' : 'text-muted hover:bg-card hover:text-primary',
            )}
          >
            <item.icon className={cn('w-5 h-5', 'transition-colors')} />
            {!collapsed && <span>{item.name}</span>}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-default bg-sidebar/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-card border border-default shadow-sm flex items-center justify-center text-blue-500 font-bold">
            {currentRole.substring(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold text-primary">
                Utilisateur actuel
              </div>
              <div className="text-xs text-muted font-medium">
                {currentRole}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function Layout() {
  const { currentRole } = useRole();
  const [collapsed, setCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('/');
  const { activeRpSection, activeAdminSection, activeAuditSection } = usePrimeSection();

  const effectiveView = useMemo(() => {
    if (currentRole === 'Pilote' && currentView === '/') return '/employee/dashboard';
    return currentView;
  }, [currentRole, currentView]);

  if (!PRIME_AUTHORIZED_ROLES.includes(currentRole)) {
    return <AccessDenied />;
  }

  const renderContent = () => {
    if (currentRole === 'Admin' || currentRole === 'RP' || currentRole === 'Audit') {
      return <Dashboard />;
    }
    switch (effectiveView) {
      case '/types':
        return <PrimeTypes />;
      case '/rules':
        return <PrimeRules />;
      case '/results':
        return <PrimeResults />;
      case '/validation':
        return <PrimeValidation />;
      case '/history':
        return <PrimeHistory />;
      case '/team-performance':
        return <TeamPerformance />;
      case '/activity-input':
        return <ActivityInput />;
      case '/configuration':
        return <PrimeConfiguration />;
      case '/notifications':
        return <NotificationsPage />;
      case '/settings':
        return <SettingsPage />;
      case '/employee/dashboard':
        return <EmployeeDashboard />;
      case '/employee/primes':
        return <MyPrimes />;
      case '/employee/performance':
        return <MyPerformance />;
      default:
        return <Dashboard />;
    }
  };

  if (currentRole === 'Admin' && activeAdminSection === 'notifications') {
    return (
      <div className="flex h-screen bg-navy-950 overflow-hidden font-sans">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          currentView={currentView}
          onChangeView={setCurrentView}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto"><NotificationsPage /></main>
          <SettingsPanel />
        </div>
      </div>
    );
  }

  if (currentRole === 'Admin' && activeAdminSection === 'settings') {
    return (
      <div className="flex h-screen bg-navy-950 overflow-hidden font-sans">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          currentView={currentView}
          onChangeView={setCurrentView}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto"><SettingsPage /></main>
          <SettingsPanel />
        </div>
      </div>
    );
  }

  if (currentRole === 'RP' && activeRpSection === 'notifications') {
    return (
      <div className="flex h-screen bg-navy-950 overflow-hidden font-sans">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          currentView={currentView}
          onChangeView={setCurrentView}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto"><NotificationsPage /></main>
          <SettingsPanel />
        </div>
      </div>
    );
  }

  if (currentRole === 'RP' && activeRpSection === 'settings') {
    return (
      <div className="flex h-screen bg-navy-950 overflow-hidden font-sans">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          currentView={currentView}
          onChangeView={setCurrentView}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto"><SettingsPage /></main>
          <SettingsPanel />
        </div>
      </div>
    );
  }

  if (currentRole === 'Audit' && activeAuditSection === 'settings') {
    return (
      <div className="flex h-screen bg-navy-950 overflow-hidden font-sans">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          currentView={currentView}
          onChangeView={setCurrentView}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto"><SettingsPage /></main>
          <SettingsPanel />
        </div>
      </div>
    );
  }

  if (currentRole === 'Audit' && activeAuditSection === 'notifications') {
    return (
      <div className="flex h-screen bg-navy-950 overflow-hidden font-sans">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          currentView={currentView}
          onChangeView={setCurrentView}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto"><NotificationsPage /></main>
          <SettingsPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden font-sans">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        currentView={currentView}
        onChangeView={setCurrentView}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
        <SettingsPanel />
      </div>
    </div>
  );
}
