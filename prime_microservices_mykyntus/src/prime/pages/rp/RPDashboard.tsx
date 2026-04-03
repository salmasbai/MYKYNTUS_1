import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, ClipboardCheck, GaugeCircle, Target } from 'lucide-react';
import { PrimeCard } from '../../components/PrimeCard';
import { RpDashboardStats, RpPrimeService } from '../../services/rp-prime.service';
import { RPTeamPerformance } from './RPTeamPerformance';
import { RPProjectTracking } from './RPProjectTracking';
import { RPFinalValidation } from './RPFinalValidation';
import { RpDrillBar } from './RpDrillBar';
import { usePrimeSection } from '../../contexts/PrimeSectionContext';
import { useHierarchyDrill } from '../../contexts/HierarchyDrillContext';

interface Props {
  rpUserId: string;
}

export function RPDashboard({ rpUserId }: Props) {
  const [stats, setStats] = useState<RpDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeRpSection } = usePrimeSection();

  useEffect(() => {
    RpPrimeService.getRpDashboardStats(rpUserId).then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, [rpUserId]);

  if (loading || !stats) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-navy-950 min-h-full space-y-8">
      <div className="flex justify-end items-end gap-4 flex-wrap">
        <RpDrillBar rpUserId={rpUserId} />
        <div className="text-sm font-medium text-slate-300 card-navy px-4 py-2 rounded-lg">Mars 2026</div>
      </div>

      {activeRpSection === 'dashboard' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Taux d'avancement projet</p>
                <p className="text-2xl font-bold text-white">{stats.projectProgress}%</p>
              </div>
            </div>

            <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-300 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Taches completees</p>
                <p className="text-2xl font-bold text-white">{stats.completedTasks}</p>
              </div>
            </div>

            <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                <GaugeCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Performance moyenne equipe</p>
                <p className="text-2xl font-bold text-white">{stats.averageTeamPerformance}%</p>
              </div>
            </div>

            <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Validations en attente</p>
                <p className="text-2xl font-bold text-white">{stats.pendingValidations}</p>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PrimeCard title="Performance Evolution" className="lg:col-span-2">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.performanceEvolution}>
                    <defs>
                      <linearGradient id="rpPerformance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#e2e8f0' }}
                      cursor={{ stroke: '#475569', strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#rpPerformance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PrimeCard>

            <PrimeCard title="Performance par membre">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.memberPerformance} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} width={100} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#e2e8f0' }} />
                    <Bar dataKey="score" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {stats.memberPerformance.map((member) => (
                  <div key={member.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{member.name}</span>
                    <span
                      className={
                        member.status === 'Excellent'
                          ? 'text-emerald-400'
                          : member.status === 'Moyen'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }
                    >
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </PrimeCard>
          </div>
        </>
      )}

      {activeRpSection === 'performance' && <RPTeamPerformance rpUserId={rpUserId} />}
      {activeRpSection === 'validation' && <RPFinalValidation rpUserId={rpUserId} />}
      {activeRpSection === 'suivi-projet' && <RPProjectTracking rpUserId={rpUserId} />}
    </div>
  );
}

