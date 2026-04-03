import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MyDocuments } from './components/MyDocuments';
import { RequestDocument } from './components/RequestDocument';
import { RequestTracking } from './components/RequestTracking';
import { Notifications } from './components/Notifications';
import { Settings } from './components/Settings';
import { HRManagement } from './components/HRManagement';
import { TemplateManagement } from './components/TemplateManagement';
import { AuditLogs } from './components/AuditLogs';
import { TeamDocuments } from './components/TeamDocuments';
import { TeamRequests } from './components/TeamRequests';
import { HRDocumentGeneration } from './components/HRDocumentGeneration';
import { 
  AdminConfiguration, 
  AdminDocTypes, 
  AdminPermissions, 
  AdminWorkflow, 
  AdminStorage 
} from './components/AdminPages';
import { AuditAccessHistory } from './components/AuditAccessHistory';
import { Role } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from './contexts/AppContext';
import { DocumentationHierarchyDrillProvider } from './contexts/DocumentationHierarchyDrillContext';
import { AuditInterfaceNavProvider } from './contexts/AuditInterfaceNavContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<Role>('Pilote');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const { t } = useAppContext();

  const renderContent = () => {
    switch (activeTab) {
      // Personal (Pilote Interface)
      case 'dashboard': return <Dashboard role={role} setActiveTab={setActiveTab} />;
      case 'my-docs': return <MyDocuments role={role} />;
      case 'request': return <RequestDocument />;
      case 'tracking': return <RequestTracking />;
      case 'notifications': return <Notifications />;
      case 'settings': return <Settings role={role} />;
      
      // Manager Interface
      case 'team-docs': return <TeamDocuments role={role} />;
      case 'team-requests': return <TeamRequests role={role} />;
      
      // RH Interface
      case 'hr-mgmt': return <HRManagement role={role} />;
      case 'doc-gen': return <HRDocumentGeneration role={role} />;
      case 'templates': return <TemplateManagement />;
      
      // Admin Interface
      case 'admin-config': return <AdminConfiguration role={role} />;
      case 'doc-types': return <AdminDocTypes role={role} />;
      case 'permissions': return <AdminPermissions role={role} />;
      case 'workflow': return <AdminWorkflow role={role} />;
      case 'storage': return <AdminStorage role={role} />;
      
      // Audit Interface
      case 'audit-logs': return <AuditLogs />;
      case 'access-history': return <AuditAccessHistory />;
      
      default: return <Dashboard role={role} setActiveTab={setActiveTab} />;
    }
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      dashboard: t('title.dashboard'),
      'my-docs': t('title.myDocs'),
      request: t('title.request'),
      tracking: t('title.tracking'),
      notifications: t('nav.notifications'),
      settings: t('nav.settings'),
      'team-docs': t('title.teamDocs'),
      'team-requests': t('title.teamRequests'),
      'hr-mgmt': t('title.hrMgmt'),
      'doc-gen': t('title.docGen'),
      templates: t('title.templates'),
      'admin-config': t('title.adminConfig'),
      'doc-types': t('title.docTypes'),
      permissions: t('title.permissions'),
      workflow: t('title.workflow'),
      storage: t('title.storage'),
      'audit-logs': t('title.auditLogs'),
      'access-history': t('title.accessHistory'),
    };
    return titles[activeTab] || t('title.dashboard');
  };

  return (
    <AuditInterfaceNavProvider>
    <DocumentationHierarchyDrillProvider role={role}>
    <div className="min-h-screen bg-navy-950 flex transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={role} 
        setRole={setRole} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-64'} min-h-screen flex flex-col`}>
        <Header title={getTitle()} setActiveTab={setActiveTab} />
        
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
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
    </DocumentationHierarchyDrillProvider>
    </AuditInterfaceNavProvider>
  );
}
