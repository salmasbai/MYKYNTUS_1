import React from 'react';
import { motion } from 'motion/react';
import { ICONS, Role } from '../../types';
import { MOCK_REQUESTS, MOCK_TEAM_DOCS } from '../../mockData';
import { Badge } from '../Badge';
import { filterByEmployeeScope } from '../../lib/documentationFilters';
import { useDocumentationHierarchyDrill } from '../../contexts/DocumentationHierarchyDrillContext';
import { DocDrillBar } from '../DocDrillBar';

interface Props {
  setActiveTab: (tab: string) => void;
  role: Role;
}

export const ManagerDashboard: React.FC<Props> = ({ setActiveTab, role }) => {
  const { drill } = useDocumentationHierarchyDrill();
  const teamRequests = filterByEmployeeScope(MOCK_REQUESTS, role, role === 'Manager' ? drill : undefined);
  const teamDocs = filterByEmployeeScope(MOCK_TEAM_DOCS, role, role === 'Manager' ? drill : undefined);
  const memberCount = new Set(
    [...teamRequests.map((r) => r.employeeId), ...teamDocs.map((d) => d.employeeId)].filter(Boolean),
  ).size;

  const stats = [
    {
      label: 'Demandes équipe',
      value: teamRequests.length,
      icon: ICONS.Team,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'En attente de validation',
      value: teamRequests.filter((r) => r.status === 'Pending').length,
      icon: ICONS.Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Générés cette semaine',
      value: teamDocs.filter((d) => d.status === 'Generated').length,
      icon: ICONS.Check,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Membres de l’équipe',
      value: memberCount,
      icon: ICONS.User,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {role === 'Manager' && <DocDrillBar role={role} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-navy p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-semibold text-white">Actions rapides</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('team-docs')}
              className="w-full card-navy p-4 flex items-center gap-4 hover:bg-navy-800 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <ICONS.Team className="w-5 h-5 text-blue-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Documents équipe</p>
                <p className="text-xs text-slate-500">Fichiers de l’équipe</p>
              </div>
              <ICONS.ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => setActiveTab('team-requests')}
              className="w-full card-navy p-4 flex items-center gap-4 hover:bg-navy-800 transition-all group"
            >
              <div className="w-10 h-10 bg-amber-600/10 rounded-lg flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                <ICONS.ClipboardList className="w-5 h-5 text-amber-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Demandes équipe</p>
                <p className="text-xs text-slate-500">Demandes en attente</p>
              </div>
              <ICONS.ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Demandes récentes (équipe)</h3>
            <button
              onClick={() => setActiveTab('team-requests')}
              className="text-sm text-blue-500 hover:text-blue-400 font-medium"
            >
              Tout voir
            </button>
          </div>
          <div className="card-navy overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy-800/50 border-b border-navy-800">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Collaborateur
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {teamRequests.slice(0, 4).map((req) => (
                  <tr key={req.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center">
                          <ICONS.User className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-200">
                          {req.employeeName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{req.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{req.requestDate}</td>
                    <td className="px-6 py-4">
                      <Badge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
