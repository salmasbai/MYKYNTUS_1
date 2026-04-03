import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { AlertTriangle, Clock3, Database, LoaderCircle } from 'lucide-react';
import { PrimeCard } from '../../components/PrimeCard';
import { AdminPrimeService } from '../../services/admin-prime.service';
import { usePrimeSection } from '../../contexts/PrimeSectionContext';
import { AdminWorkflow } from './AdminWorkflow';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [calculationConfig, setCalculationConfig] = useState<any>(null);
  const [rbacRows, setRbacRows] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const { activeAdminSection } = usePrimeSection();

  useEffect(() => {
    AdminPrimeService.getDashboard().then(setData);
    AdminPrimeService.getCalculationConfig().then(setCalculationConfig);
    AdminPrimeService.getRbacMatrix().then(setRbacRows);
    AdminPrimeService.getAuditLogs().then(setLogs);
    AdminPrimeService.getAnomalies().then(setAnomalies);
  }, []);

  if (activeAdminSection === 'workflows') {
    return <AdminWorkflow />;
  }

  if (!data || !calculationConfig) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div></div>;
  }

  const saveCalculation = async () => {
    const saved = await AdminPrimeService.saveCalculationConfig(calculationConfig);
    setCalculationConfig(saved);
  };

  const togglePermission = async (role: string, permission: 'read' | 'edit' | 'validate' | 'configure') => {
    const updated = await AdminPrimeService.toggleRbacPermission(role, permission);
    setRbacRows(updated);
  };

  const refreshAnomalies = () => {
    AdminPrimeService.getAnomalies().then(setAnomalies);
  };

  const correctAnomaly = async (id: string) => {
    const updated = await AdminPrimeService.updateAnomalyStatus(id, 'Corrigee');
    setAnomalies(updated);
  };

  const ignoreAnomaly = async (id: string) => {
    const updated = await AdminPrimeService.updateAnomalyStatus(id, 'Ignoree');
    setAnomalies(updated);
  };

  return (
    <div className="p-8 space-y-8 bg-navy-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Admin Systeme</h1>
        <p className="text-slate-400 mt-1">Supervision technique, gouvernance et controle du moteur PRIME.</p>
      </div>

      {activeAdminSection === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
              <Database className="w-6 h-6 text-cyan-300" />
              <div>
                <p className="text-slate-400 text-sm">Primes generees</p>
                <p className="text-white text-2xl font-bold">{data.kpis.totalGeneratedPrimes}</p>
              </div>
            </div>
            <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
              <LoaderCircle className="w-6 h-6 text-amber-300" />
              <div>
                <p className="text-slate-400 text-sm">Validations en cours</p>
                <p className="text-white text-2xl font-bold">{data.kpis.validationsInProgress}</p>
              </div>
            </div>
            <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-300" />
              <div>
                <p className="text-slate-400 text-sm">Erreurs detectees</p>
                <p className="text-white text-2xl font-bold">{data.kpis.errorCount}</p>
              </div>
            </div>
            <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
              <Clock3 className="w-6 h-6 text-emerald-300" />
              <div>
                <p className="text-slate-400 text-sm">Temps moyen traitement</p>
                <p className="text-white text-2xl font-bold">{data.kpis.avgProcessingTimeSec}s</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PrimeCard title="Volume primes par mois" className="lg:col-span-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.volumeByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee33" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PrimeCard>
            <PrimeCard title="Taux de validation">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.validationRate}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PrimeCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PrimeCard title="Repartition par departement">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts.byDepartment} dataKey="value" nameKey="name" outerRadius={85}>
                      <Cell fill="#22d3ee" />
                      <Cell fill="#818cf8" />
                      <Cell fill="#34d399" />
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </PrimeCard>

            <PrimeCard title="Alertes systeme" className="lg:col-span-2">
              <div className="space-y-3">
                {data.alerts.map((alert: any) => (
                  <div key={alert.id} className="rounded-xl border border-default bg-navy-900 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-medium">{alert.type}</span>
                      <span className="text-xs text-slate-400">{alert.date}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{alert.message}</p>
                    <p className={alert.severity === 'Haute' ? 'text-rose-300 text-xs mt-2' : 'text-amber-300 text-xs mt-2'}>
                      Severite: {alert.severity}
                    </p>
                  </div>
                ))}
              </div>
            </PrimeCard>
          </div>
        </>
      )}

      {activeAdminSection === 'engine' && (
        <PrimeCard title="Moteur de calcul des primes">
          <div className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm">Formule de calcul</label>
              <textarea
                value={calculationConfig.formula}
                onChange={(e) => setCalculationConfig({ ...calculationConfig, formula: e.target.value })}
                className="mt-1 w-full h-24 bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="number"
                value={calculationConfig.weights.individualPerformance}
                onChange={(e) =>
                  setCalculationConfig({
                    ...calculationConfig,
                    weights: { ...calculationConfig.weights, individualPerformance: Number(e.target.value) },
                  })
                }
                className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
              <input
                type="number"
                value={calculationConfig.weights.teamPerformance}
                onChange={(e) =>
                  setCalculationConfig({
                    ...calculationConfig,
                    weights: { ...calculationConfig.weights, teamPerformance: Number(e.target.value) },
                  })
                }
                className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
              <input
                type="number"
                value={calculationConfig.weights.objectives}
                onChange={(e) =>
                  setCalculationConfig({
                    ...calculationConfig,
                    weights: { ...calculationConfig.weights, objectives: Number(e.target.value) },
                  })
                }
                className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="number"
                value={calculationConfig.parameters.cap}
                onChange={(e) =>
                  setCalculationConfig({
                    ...calculationConfig,
                    parameters: { ...calculationConfig.parameters, cap: Number(e.target.value) },
                  })
                }
                className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
              <input
                type="number"
                value={calculationConfig.parameters.minThreshold}
                onChange={(e) =>
                  setCalculationConfig({
                    ...calculationConfig,
                    parameters: { ...calculationConfig.parameters, minThreshold: Number(e.target.value) },
                  })
                }
                className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
              <input
                type="number"
                value={calculationConfig.parameters.bonus}
                onChange={(e) =>
                  setCalculationConfig({
                    ...calculationConfig,
                    parameters: { ...calculationConfig.parameters, bonus: Number(e.target.value) },
                  })
                }
                className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={saveCalculation}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
              >
                Enregistrer moteur
              </button>
            </div>
          </div>
        </PrimeCard>
      )}

      {activeAdminSection === 'access' && (
        <PrimeCard title="Gestion des acces (RBAC)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left py-3 text-slate-400">Role</th>
                  <th className="text-left py-3 text-slate-400">Lire</th>
                  <th className="text-left py-3 text-slate-400">Modifier</th>
                  <th className="text-left py-3 text-slate-400">Valider</th>
                  <th className="text-left py-3 text-slate-400">Configurer</th>
                </tr>
              </thead>
              <tbody>
                {rbacRows.map((row) => (
                  <tr key={row.role} className="border-b border-default/60">
                    <td className="py-3 text-slate-200">{row.role}</td>
                    {(['read', 'edit', 'validate', 'configure'] as const).map((permission) => (
                      <td key={permission} className="py-3">
                        <button
                          onClick={() => togglePermission(row.role, permission)}
                          className={`px-3 py-1 rounded-md text-xs ${
                            row[permission] ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {row[permission] ? 'Oui' : 'Non'}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrimeCard>
      )}

      {activeAdminSection === 'logs' && (
        <PrimeCard title="Supervision & logs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left py-3 text-slate-400">Utilisateur</th>
                  <th className="text-left py-3 text-slate-400">Action</th>
                  <th className="text-left py-3 text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-default/60">
                    <td className="py-3 text-slate-200">{log.user}</td>
                    <td className="py-3 text-slate-300">{log.action}</td>
                    <td className="py-3 text-slate-400">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrimeCard>
      )}

      {activeAdminSection === 'anomalies' && (
        <PrimeCard title="Gestion des anomalies">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left py-3 text-slate-400">Type</th>
                  <th className="text-left py-3 text-slate-400">Description</th>
                  <th className="text-left py-3 text-slate-400">Statut</th>
                  <th className="text-right py-3 text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((row) => (
                  <tr key={row.id} className="border-b border-default/60">
                    <td className="py-3 text-slate-200">{row.type}</td>
                    <td className="py-3 text-slate-300">{row.description}</td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          row.status === 'Ouverte'
                            ? 'bg-amber-500/20 text-amber-300'
                            : row.status === 'Corrigee'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-500/20 text-slate-300'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        {row.status === 'Ouverte' && (
                          <>
                            <button onClick={() => correctAnomaly(row.id)} className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs">
                              Corriger
                            </button>
                            <button onClick={() => refreshAnomalies()} className="px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-xs">
                              Relancer calcul
                            </button>
                            <button onClick={() => ignoreAnomaly(row.id)} className="px-3 py-1 rounded-md bg-slate-500/20 text-slate-300 text-xs">
                              Ignorer
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrimeCard>
      )}
    </div>
  );
}
