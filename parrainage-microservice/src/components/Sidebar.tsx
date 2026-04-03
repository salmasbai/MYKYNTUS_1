import React from 'react';
import { motion } from 'motion/react';
import { ICONS, Role } from '../types';
import { useAppContext } from '../i18n/appContext';
import { useAuth } from '../../frontend/app/hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  role,
  setRole,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { t } = useAppContext();
  const { loginAsRole } = useAuth();

  const personalItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: ICONS.Dashboard },
    { id: 'submit', label: t('nav.submitReferral'), icon: ICONS.Request },
    { id: 'my-referrals', label: t('nav.myReferrals'), icon: ICONS.Documents },
    { id: 'bonus', label: t('nav.bonus'), icon: ICONS.Euro },
  ];

  const getManagementItems = () => {
    switch (role) {
      case 'Admin':
        return [{ id: 'admin-dashboard', label: 'Supervision technique', icon: ICONS.Activity }];
      case 'RH':
        return [
          { id: 'rh-queue', label: 'File de validation', icon: ICONS.Documents },
          { id: 'rh-bonus', label: 'Règles de prime', icon: ICONS.Settings },
        ];
      case 'RP':
        return [{ id: 'rp-dashboard', label: 'Projets & ressources', icon: ICONS.Team }];
      case 'Manager':
        return [{ id: 'manager-dashboard', label: 'Équipe & engagement', icon: ICONS.Team }];
      case 'Pilote':
        return [{ id: 'pilote-dashboard', label: 'Impact opérationnel', icon: ICONS.Activity }];
      case 'Collaborateur':
      default:
        return personalItems;
    }
  };

  const managementItems = getManagementItems();

  return (
    <div
      className={`h-screen bg-navy-900 border-r border-navy-800 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-[70px]' : 'w-64'
      }`}
    >
      <div
        className={`p-4 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } gap-3`}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]">
              <ICONS.Documents className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
              Parrainage
            </h1>
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
        {role === 'Collaborateur' && (
          <div>
            {!isCollapsed && (
              <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Collaborateur
              </h3>
            )}
            <div className="space-y-1">
              {personalItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                  } py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]'
                      : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                  )}
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

        {role !== 'Collaborateur' && (
          <div>
            {!isCollapsed && (
              <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                {role}
              </h3>
            )}
            <div className="space-y-1">
              {managementItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                  } py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]'
                      : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                  )}
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
          <div
            className="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center text-sm font-bold text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]"
            title={`Rôle actuel : ${role}`}
          >
            {role[0]}
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">
              {t('nav.switchRole')}
            </label>
            <select
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as Role;
                setRole(newRole);
                // Synchronise le rôle de démo avec l'AuthProvider, sinon les écrans RH
                // (qui utilisent `useAuth`) restent en "EMPLOYEE" et bloquent l'accès.
                switch (newRole) {
                  case 'Collaborateur':
                    loginAsRole('EMPLOYEE');
                    break;
                  case 'Admin':
                    loginAsRole('ADMIN');
                    break;
                  case 'RH':
                    loginAsRole('RH');
                    break;
                  case 'RP':
                    loginAsRole('RP');
                    break;
                  case 'Manager':
                    loginAsRole('MANAGER');
                    break;
                  case 'Pilote':
                    loginAsRole('PILOTE');
                    break;
                }
                switch (newRole) {
                  case 'Collaborateur':
                    setActiveTab('dashboard');
                    break;
                  case 'Admin':
                    setActiveTab('admin-dashboard');
                    break;
                  case 'RH':
                    setActiveTab('rh-queue');
                    break;
                  case 'RP':
                    setActiveTab('rp-dashboard');
                    break;
                  case 'Manager':
                    setActiveTab('manager-dashboard');
                    break;
                  case 'Pilote':
                    setActiveTab('pilote-dashboard');
                    break;
                }
              }}
              className="w-full bg-navy-800 border border-navy-700 text-slate-300 text-sm rounded-lg p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer transition-all"
            >
              <option value="Collaborateur">Collaborateur</option>
              <option value="RH">RH</option>
              <option value="Admin">Administrateur</option>
              <option value="RP">Responsable Projet</option>
              <option value="Manager">Manager</option>
              <option value="Pilote">Pilote</option>
            </select>
          </div>
        )}
        <button
          title={isCollapsed ? t('nav.logout') : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-3 px-4 py-3'
          } text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all`}
        >
          <ICONS.Logout className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">{t('nav.logout')}</span>}
        </button>
      </div>
    </div>
  );
};

