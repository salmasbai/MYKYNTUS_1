import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../../shared/components/Sidebar';
import { Header } from '../../shared/components/Header';
import { UiPreferencesService } from '../../../src/modules/parrainage/core/services/UiPreferencesService';
import { useNavigation } from '../providers/NavigationProvider';
import { PiloteDashboard } from '../../../src/parrainage/pages/pilote/PiloteDashboard';
import { PiloteSubmitReferral } from '../../../src/parrainage/pages/pilote/PiloteSubmitReferral';
import { PiloteMyReferrals } from '../../../src/parrainage/pages/pilote/PiloteMyReferrals';
import { PiloteBonus } from '../../../src/parrainage/pages/pilote/PiloteBonus';
import { ReferralDashboardRH } from '../../../src/parrainage/pages/rh/ReferralDashboardRH';
import { ReferralManagement } from '../../../src/parrainage/pages/rh/ReferralManagement';
import { ReferralDetailsRH } from '../../../src/parrainage/pages/rh/ReferralDetailsRH';
import { ReferralRules } from '../../../src/parrainage/pages/rh/ReferralRules';
import { ReferralHistory } from '../../../src/parrainage/pages/rh/ReferralHistory';
import { AdminDashboard } from '../../../src/parrainage/pages/admin/AdminDashboard';
import { AdminSupportCenter } from '../../../src/parrainage/pages/admin/AdminSupportCenter';
import { AdminWorkflow } from '../../../src/parrainage/pages/admin/AdminWorkflow';
import { AdminSystemConfig } from '../../../src/parrainage/pages/admin/AdminSystemConfig';
import { AdminPayments } from '../../../src/parrainage/pages/admin/AdminPayments';
import { AdminAuditLog } from '../../../src/parrainage/pages/admin/AdminAuditLog';
import { PMDashboard } from '../../../src/parrainage/pages/pm/PMDashboard';
import { PMTeamMembers } from '../../../src/parrainage/pages/pm/PMTeamMembers';
import { PMPerformance } from '../../../src/parrainage/pages/pm/PMPerformance';
import { ReferralManagementPage } from '../../../src/modules/parrainage/features/referrals/ReferralManagementPage';
import { GlobalNotificationsPage } from '../../../src/parrainage/pages/shared/GlobalNotificationsPage';
import { GlobalSettingsPage } from '../../../src/parrainage/pages/shared/GlobalSettingsPage';
import { useAuth } from '../hooks/useAuth';
import { PMDrillBar } from '../../../src/parrainage/components/PMDrillBar';
import { AuditInterfaceProvider } from '../contexts/AuditInterfaceContext';

export const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [compact, setCompact] = React.useState(() => UiPreferencesService.get().compactMode);
  const { currentView } = useNavigation();
  const { user } = useAuth();
  const showPmDrill =
    !!user && (user.role === 'MANAGER' || user.role === 'RP') && currentView.startsWith('pm-');

  React.useEffect(() => {
    const onPrefs = () => setCompact(UiPreferencesService.get().compactMode);
    window.addEventListener('parrainage:ui-prefs', onPrefs);
    return () => window.removeEventListener('parrainage:ui-prefs', onPrefs);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'pilote-dashboard': return <PiloteDashboard />;
      case 'pilote-submit': return <PiloteSubmitReferral />;
      case 'pilote-referrals': return <PiloteMyReferrals />;
      case 'pilote-bonus': return <PiloteBonus />;
      case 'rh-dashboard': return <ReferralDashboardRH />;
      case 'rh-management': return <ReferralManagement />;
      case 'rh-details': return <ReferralDetailsRH />;
      case 'rh-rules': return <ReferralRules />;
      case 'rh-history': return <ReferralHistory />;
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-tools': return <AdminSupportCenter />;
      case 'admin-workflow': return <AdminWorkflow />;
      case 'admin-config': return <AdminSystemConfig />;
      case 'admin-payments': return <AdminPayments />;
      case 'admin-audit': return <AdminAuditLog />;
      case 'pm-dashboard': return <PMDashboard />;
      case 'pm-team': return <PMTeamMembers />;
      case 'pm-referrals': return <ReferralManagementPage mode="pm" />;
      case 'pm-performance': return <PMPerformance />;
      case 'notifications': return <GlobalNotificationsPage />;
      case 'settings': return <GlobalSettingsPage />;
      default: return <PiloteDashboard />;
    }
  };

  return (
    <AuditInterfaceProvider>
    <div className="min-h-screen flex bg-navy-950 text-slate-100 transition-colors duration-300">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-[70px]' : 'ml-64'} min-h-screen`}>
        <Header />
        <div className={`flex-1 ${compact ? 'p-4' : 'p-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {showPmDrill && <PMDrillBar />}
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className="p-8 border-t border-navy-800 text-center transition-colors duration-300">
          <p className="text-xs text-slate-600">
            © 2024 MyKyntus — Plateforme RH entreprise. Tous droits réservés.
          </p>
        </footer>
      </main>
    </div>
    </AuditInterfaceProvider>
  );
};

