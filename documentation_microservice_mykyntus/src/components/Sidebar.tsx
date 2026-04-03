import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, BarChart, Shield } from 'lucide-react';
import type { AuditInterfaceSectionId } from '../contexts/AuditInterfaceNavContext';
import { ICONS, Role } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useAuditInterfaceNav } from '../contexts/AuditInterfaceNavContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, setRole, isCollapsed, setIsCollapsed }) => {
  const { t } = useAppContext();
  const { section, setSection } = useAuditInterfaceNav();

  const personalItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: ICONS.Dashboard },
    { id: 'my-docs', label: t('nav.myDocs'), icon: ICONS.Documents },
    { id: 'request', label: t('nav.requestDoc'), icon: ICONS.Request },
    { id: 'tracking', label: t('nav.requestTracking'), icon: ICONS.History },
    { id: 'notifications', label: t('nav.notifications'), icon: ICONS.Bell },
    { id: 'settings', label: t('nav.settings'), icon: ICONS.Settings },
  ];

  const managerItems = [
    { id: 'team-docs', label: t('nav.teamDocs'), icon: ICONS.Team },
    { id: 'team-requests', label: t('nav.teamRequests'), icon: ICONS.ClipboardList },
    { id: 'notifications', label: t('nav.notifications'), icon: ICONS.Bell },
    { id: 'settings', label: t('nav.settings'), icon: ICONS.Settings },
  ];

  const hrItems = [
    { id: 'hr-mgmt', label: t('nav.allRequests'), icon: ICONS.Management },
    { id: 'doc-gen', label: t('nav.docGen'), icon: ICONS.Edit },
    { id: 'templates', label: t('nav.templates'), icon: ICONS.Config },
    { id: 'notifications', label: t('nav.notifications'), icon: ICONS.Bell },
    { id: 'settings', label: t('nav.settings'), icon: ICONS.Settings },
  ];

  const rpItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: ICONS.Dashboard },
    { id: 'team-docs', label: t('nav.teamDocs'), icon: ICONS.Team },
    { id: 'hr-mgmt', label: t('nav.allRequests'), icon: ICONS.Management },
    { id: 'notifications', label: t('nav.notifications'), icon: ICONS.Bell },
    { id: 'settings', label: t('nav.settings'), icon: ICONS.Settings },
  ];

  const adminItems = [
    { id: 'admin-config', label: t('nav.adminConfig'), icon: ICONS.Config },
    { id: 'doc-types', label: t('nav.docTypes'), icon: ICONS.Types },
    { id: 'permissions', label: t('nav.permissions'), icon: ICONS.Permissions },
    { id: 'storage', label: t('nav.storage'), icon: ICONS.Storage },
    { id: 'notifications', label: t('nav.notifications'), icon: ICONS.Bell },
    { id: 'settings', label: t('nav.settings'), icon: ICONS.Settings },
  ];

  const getManagementItems = () => {
    switch (role) {
      case 'Manager':
      case 'Coach':
        return managerItems;
      case 'RH': return hrItems;
      case 'RP': return rpItems;
      case 'Admin': return adminItems;
      case 'Audit': return [];
      default: return [];
    }
  };

  const managementItems = getManagementItems();

  const auditNavItems: Array<{
    key: string;
    label: string;
    icon: typeof ICONS.Dashboard;
    isActive: (tab: string, s: AuditInterfaceSectionId) => boolean;
    onSelect: () => void;
  }> = [
    {
      key: 'journal',
      label: 'Journal d’audit',
      icon: ICONS.Logs,
      isActive: (tab, s) => tab === 'audit-logs' && s === 'journal',
      onSelect: () => { setSection('journal'); setActiveTab('audit-logs'); },
    },
    {
      key: 'hist',
      label: t('nav.accessHistory'),
      icon: Shield,
      isActive: (tab, s) => tab === 'audit-logs' && s === 'access-history',
      onSelect: () => { setSection('access-history'); setActiveTab('audit-logs'); },
    },
    {
      key: 'anom',
      label: 'Anomalies',
      icon: AlertTriangle,
      isActive: (tab, s) => tab === 'audit-logs' && s === 'anomalies',
      onSelect: () => { setSection('anomalies'); setActiveTab('audit-logs'); },
    },
    {
      key: 'report',
      label: 'Reporting',
      icon: BarChart,
      isActive: (tab, s) => tab === 'audit-logs' && s === 'reporting',
      onSelect: () => { setSection('reporting'); setActiveTab('audit-logs'); },
    },
    {
      key: 'notif',
      label: t('nav.notifications'),
      icon: ICONS.Bell,
      isActive: (tab, _s) => tab === 'notifications',
      onSelect: () => setActiveTab('notifications'),
    },
    {
      key: 'sett',
      label: t('nav.settings'),
      icon: ICONS.Settings,
      isActive: (tab, _s) => tab === 'settings',
      onSelect: () => setActiveTab('settings'),
    },
  ];

  return (
    <div className={`h-screen bg-navy-900 border-r border-navy-800 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-[70px]' : 'w-64'}`}>
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]">
              <ICONS.Documents className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">MyKyntus</h1>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors shrink-0"
        >
          {isCollapsed ? <ICONS.Menu className="w-5 h-5" /> : <ICONS.ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-6 overflow-y-auto pb-4 overflow-x-hidden mt-4">
        {role === 'Pilote' && (
          <div>
            {!isCollapsed && <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('nav.personal')}</h3>}
            <div className="space-y-1">
              {personalItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 ring-1 ring-blue-500/30 shadow-[0_0_14px_rgba(37,99,235,0.18)]' 
                      : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                  {activeTab === item.id && !isCollapsed && (
                    <motion.div 
                      layoutId="active-pill"
                      className="ml-auto w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {role === 'Audit' && (
          <div className="space-y-1">
            {auditNavItems.map((item) => {
              const isActive = item.isActive(activeTab, section);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onSelect}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 ring-1 ring-blue-500/30 shadow-[0_0_14px_rgba(37,99,235,0.18)]'
                      : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="active-pill-audit"
                      className="ml-auto w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {role !== 'Pilote' && role !== 'Audit' && (
          <div>
            {!isCollapsed && <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{role} {t('nav.interface')}</h3>}
            <div className="space-y-1">
              {managementItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 ring-1 ring-blue-500/30 shadow-[0_0_14px_rgba(37,99,235,0.18)]' 
                      : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                  {activeTab === item.id && !isCollapsed && (
                    <motion.div 
                      layoutId="active-pill"
                      className="ml-auto w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className={`p-4 border-t border-navy-800 ${isCollapsed ? 'flex flex-col items-center gap-4' : ''}`}>
        {isCollapsed ? (
          <div className="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center text-sm font-bold text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]" title={`Current Role: ${role}`}>
            {role[0]}
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">{t('nav.switchRole')}</label>
            <select 
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as Role;
                setRole(newRole);
                
                switch (newRole) {
                  case 'Pilote': setActiveTab('dashboard'); break;
                  case 'Manager':
                  case 'Coach':
                    setActiveTab('team-docs'); break;
                  case 'RH': setActiveTab('hr-mgmt'); break;
                  case 'RP': setActiveTab('dashboard'); break;
                  case 'Admin': setActiveTab('admin-config'); break;
                  case 'Audit': setActiveTab('audit-logs'); break;
                }
              }}
              className="w-full bg-navy-800 border border-navy-700 text-slate-300 text-sm rounded-lg p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer transition-all"
            >
              <option value="Pilote">Pilote</option>
              <option value="Coach">Coach</option>
              <option value="Manager">Manager</option>
              <option value="RH">RH</option>
              <option value="RP">RP</option>
              <option value="Admin">Admin</option>
              <option value="Audit">Audit</option>
            </select>
          </div>
        )}
        <button 
          title={isCollapsed ? t('nav.logout') : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-4 py-3'} text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all`}
        >
          <ICONS.Logout className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">{t('nav.logout')}</span>}
        </button>
      </div>
    </div>
  );
};
