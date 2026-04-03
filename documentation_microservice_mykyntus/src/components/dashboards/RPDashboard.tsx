import React from 'react';
import { motion } from 'motion/react';
import { ICONS, Role } from '../../types';
import { MOCK_REQUESTS } from '../../mockData';
import { filterByEmployeeScope } from '../../lib/documentationFilters';
import { useDocumentationHierarchyDrill } from '../../contexts/DocumentationHierarchyDrillContext';
import { DocDrillBar } from '../DocDrillBar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Props {
  setActiveTab: (tab: string) => void;
  role: Role;
}

export const RPDashboard: React.FC<Props> = ({ role }) => {
  const { drill } = useDocumentationHierarchyDrill();
  const scopedReq = filterByEmployeeScope(MOCK_REQUESTS, role, drill);
  const totalRequests = scopedReq.length;
  const approved = scopedReq.filter(
    (r) => r.status === 'Approved' || r.status === 'Generated'
  ).length;
  const rejected = scopedReq.filter((r) => r.status === 'Rejected').length;

  const approvalRate =
    totalRequests > 0 ? Math.round((approved / totalRequests) * 100) : 0;
  const rejectionRate =
    totalRequests > 0 ? Math.round((rejected / totalRequests) * 100) : 0;

  const stats = [
    {
      label: 'Total des demandes',
      value: totalRequests,
      icon: ICONS.History,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Taux d’approbation',
      value: `${approvalRate} %`,
      icon: ICONS.Check,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Taux de rejet',
      value: `${rejectionRate} %`,
      icon: ICONS.X,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Utilisateurs actifs',
      value: 142,
      icon: ICONS.Team,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
  ];

  const evolutionData = [
    { name: 'janv.', requests: 45 },
    { name: 'févr.', requests: 52 },
    { name: 'mars', requests: 38 },
    { name: 'avr.', requests: 65 },
    { name: 'mai', requests: 48 },
    { name: 'juin', requests: 70 },
  ];

  const typeData = [
    { name: 'Attestation', value: 45 },
    { name: 'Fiche de paie', value: 30 },
    { name: 'Contrat', value: 15 },
    { name: 'Avenant', value: 10 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

  return (
    <div className="space-y-8">
      <DocDrillBar role={role} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-navy p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Évolution des demandes
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-navy p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Répartition par type de document
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {typeData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-xs text-slate-400">
                  {entry.name} ({entry.value} %)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
