import React from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ setActiveTab }) => {
  const stats = [
    {
      label: 'Utilisateurs actifs',
      value: 342,
      icon: ICONS.User,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Types de documents',
      value: 12,
      icon: ICONS.Types,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Rôles gérés',
      value: 5,
      icon: ICONS.Permissions,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Santé du système',
      value: '99,9 %',
      icon: ICONS.Activity,
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
          <h3 className="text-lg font-semibold text-white">Configuration système</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('doc-types')}
              className="w-full card-navy p-4 flex items-center gap-4 hover:bg-navy-800 transition-all group"
            >
              <div className="w-10 h-10 bg-amber-600/10 rounded-lg flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                <ICONS.Types className="w-5 h-5 text-amber-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Types de documents</p>
                <p className="text-xs text-slate-500">Types disponibles</p>
              </div>
              <ICONS.ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className="w-full card-navy p-4 flex items-center gap-4 hover:bg-navy-800 transition-all group"
            >
              <div className="w-10 h-10 bg-emerald-600/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <ICONS.Permissions className="w-5 h-5 text-emerald-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Permissions</p>
                <p className="text-xs text-slate-500">Politiques d’accès (RBAC)</p>
              </div>
              <ICONS.ChevronRight className="ml-auto w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Utilisation des modules</h3>
          </div>
          <div className="card-navy p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-navy-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <ICONS.Documents className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Documents générés</p>
                  <p className="text-xs text-slate-500">Total ce mois-ci</p>
                </div>
              </div>
              <span className="text-xl font-bold text-white">1 245</span>
            </div>
            <div className="flex items-center justify-between border-b border-navy-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <ICONS.Check className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Taux de succès API</p>
                  <p className="text-xs text-slate-500">Moyenne des points de terminaison</p>
                </div>
              </div>
              <span className="text-xl font-bold text-white">99,8 %</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <ICONS.Storage className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Stockage utilisé</p>
                  <p className="text-xs text-slate-500">Consommation blob</p>
                </div>
              </div>
              <span className="text-xl font-bold text-white">45,2 Go</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
