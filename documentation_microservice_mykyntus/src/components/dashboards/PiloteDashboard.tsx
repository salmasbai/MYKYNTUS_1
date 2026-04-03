import React from 'react';
import { motion } from 'motion/react';
import { ICONS, Role } from '../../types';
import { MOCK_DOCUMENTS, MOCK_REQUESTS } from '../../mockData';
import { Badge } from '../Badge';
import { filterByEmployeeScope } from '../../lib/documentationFilters';

interface Props {
  setActiveTab: (tab: string) => void;
  role: Role;
}

export const PiloteDashboard: React.FC<Props> = ({ setActiveTab, role }) => {
  const myDocs = filterByEmployeeScope(MOCK_DOCUMENTS, role);
  const myReqs = filterByEmployeeScope(MOCK_REQUESTS, role);
  const stats = [
    {
      label: 'Mes documents',
      value: myDocs.length,
      icon: ICONS.Documents,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Demandes actives',
      value: myReqs.filter((r) => r.status === 'Pending').length,
      icon: ICONS.Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Approuvées',
      value: myReqs.filter((r) => r.status === 'Approved').length,
      icon: ICONS.Check,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Total des demandes',
      value: myReqs.length,
      icon: ICONS.History,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="space-y-8">
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
              onClick={() => setActiveTab('request')}
              className="w-full card-navy p-4 flex items-center gap-4 hover:bg-navy-800 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <ICONS.Request className="w-5 h-5 text-blue-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Demander un document</p>
                <p className="text-xs text-slate-500">Nouvelle demande RH</p>
              </div>
              <ICONS.ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => setActiveTab('my-docs')}
              className="w-full card-navy p-4 flex items-center gap-4 hover:bg-navy-800 transition-all group"
            >
              <div className="w-10 h-10 bg-emerald-600/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <ICONS.Documents className="w-5 h-5 text-emerald-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Mes documents</p>
                <p className="text-xs text-slate-500">Accéder aux fichiers générés</p>
              </div>
              <ICONS.ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Demandes récentes</h3>
            <button
              onClick={() => setActiveTab('tracking')}
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
                {MOCK_REQUESTS.slice(0, 4).map((req) => (
                  <tr key={req.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-navy-800 rounded flex items-center justify-center">
                          <ICONS.Documents className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-200">{req.type}</span>
                      </div>
                    </td>
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
