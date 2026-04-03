import { useEffect, useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { PrimeService } from '../services/prime.service';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Award, Wallet } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { RPDashboard } from './rp/RPDashboard';
import { AdminDashboard } from './admin/AdminDashboard';
import { AuditRoot } from './audit/AuditRoot';
import { NotificationsPage } from './Notifications';
import { usePrimeSection } from '../contexts/PrimeSectionContext';

export function Dashboard() {
  const { currentRole, currentUser } = useRole();
  const { activeRpSection, activeAdminSection } = usePrimeSection();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isSpecialRole = currentRole === 'RP' || currentRole === 'Admin' || currentRole === 'Audit';

  useEffect(() => {
    let cancelled = false;

    if (isSpecialRole) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    PrimeService.getDashboardStats().then((data) => {
      if (cancelled) return;
      setStats(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isSpecialRole]);

  if (currentRole === 'RP') {
    if (activeRpSection === 'notifications') return <NotificationsPage />;
    return <RPDashboard rpUserId={currentUser.id} />;
  }
  if (currentRole === 'Admin') {
    if (activeAdminSection === 'notifications') return <NotificationsPage />;
    return <AdminDashboard />;
  }
  if (currentRole === 'Audit') {
    return <AuditRoot />;
  }

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="p-8 space-y-8 bg-navy-950 min-h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Prime Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of bonus performance and distribution.</p>
        </div>
        <div className="text-sm font-medium text-slate-300 card-navy px-4 py-2 rounded-lg">
          March 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Primes</p>
            <p className="text-2xl font-bold text-white">{stats.totalPrimesThisMonth}</p>
          </div>
        </div>
        <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Budget Used</p>
            <p className="text-2xl font-bold text-white">{stats.budgetConsumption}%</p>
          </div>
        </div>
        <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Top Team</p>
            <p className="text-lg font-bold text-white truncate">{stats.topTeams[0]?.name}</p>
          </div>
        </div>
        <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Top Performer</p>
            <p className="text-lg font-bold text-white truncate">{stats.topEmployees[0]?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PrimeCard title="Prime Evolution" className="lg:col-span-2">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.primeEvolution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PrimeCard>

        <PrimeCard title="By Department">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.primeByDepartment} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PrimeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PrimeCard title="Top Teams">
          <div className="space-y-4">
            {stats.topTeams.map((team: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-navy-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy-800 text-slate-300 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <span className="font-medium text-slate-200">{team.name}</span>
                </div>
                <span className="font-semibold text-blue-400">{team.amount} MAD</span>
              </div>
            ))}
          </div>
        </PrimeCard>
        <PrimeCard title="Top Employees">
          <div className="space-y-4">
            {stats.topEmployees.map((emp: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-navy-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-200">{emp.name}</span>
                </div>
                <span className="font-semibold text-emerald-400">{emp.amount} MAD</span>
              </div>
            ))}
          </div>
        </PrimeCard>
      </div>
    </div>
  );
}
