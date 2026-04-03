import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { AlertTriangle, Download, FileText, Globe, ShieldCheck } from 'lucide-react';
import { PrimeCard } from '../../components/PrimeCard';
import { AuditPrimeService } from '../../services/audit-prime.service';
import type { AuditOperation } from '../../mock-data/audit';

export function AuditDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [operations, setOperations] = useState<AuditOperation[]>([]);

  useEffect(() => {
    AuditPrimeService.getDashboard().then(setDashboard);
    AuditPrimeService.getOperations().then(setOperations);
  }, []);

  const exportAudit = () => {
    // Export simulation UI: fichier CSV généré côté client (read-only).
    const header = ['operationId', 'employee', 'project', 'status', 'date'].join(';');
    const rows = operations.map((op) => [op.id, op.employeeName, op.projectName, op.status, op.date].join(';'));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_prime_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const lines = [
      'REPORT PRIME AUDIT',
      `Date generation: ${new Date().toISOString()}`,
      '',
      `Total primes: ${dashboard?.kpis.totalPrimes ?? '-'}`,
      `Validations: ${dashboard?.kpis.validations ?? '-'}`,
      `Anomalies: ${dashboard?.kpis.anomalies ?? '-'}`,
      `Taux de conformité: ${dashboard?.kpis.conformityRate ?? '-'}%`,
      '',
      'Observations (mock):',
      '- Contrôle basé sur données de validation et vérifications de cohérence.',
      '- Exposition volontairement non modifiable (lecture seule).',
      '',
      `Opérations auditées: ${operations.length}`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_prime_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!dashboard) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
          <Globe className="w-6 h-6 text-cyan-300" />
          <div>
            <p className="text-slate-400 text-sm">Nombre total de primes</p>
            <p className="text-white text-2xl font-bold">{dashboard.kpis.totalPrimes}</p>
          </div>
        </div>

        <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-300" />
          <div>
            <p className="text-slate-400 text-sm">Nombre de validations</p>
            <p className="text-white text-2xl font-bold">{dashboard.kpis.validations}</p>
          </div>
        </div>

        <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
          <AlertTriangle className="w-6 h-6 text-rose-300" />
          <div>
            <p className="text-slate-400 text-sm">Nombre d’anomalies</p>
            <p className="text-white text-2xl font-bold">{dashboard.kpis.anomalies}</p>
          </div>
        </div>

        <div className="card-navy p-6 rounded-2xl flex items-center gap-4">
          <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-300 font-bold">
            %
          </div>
          <div>
            <p className="text-slate-400 text-sm">Taux de conformité</p>
            <p className="text-white text-2xl font-bold">{dashboard.kpis.conformityRate}%</p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PrimeCard title="Flux de validation" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.charts.flowByStep} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="step" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} fill="#22d3ee33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PrimeCard>

        <PrimeCard title="Taux validation vs rejet">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard.charts.validationVsRejection}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={55}
                >
                  <Cell fill="#60a5fa" />
                  <Cell fill="#f87171" />
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PrimeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PrimeCard title="Activité par rôle">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.charts.activityByRole} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="role" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} width={110} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#34d399" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PrimeCard>

        <PrimeCard title="Reporting">
          <div className="space-y-3">
            <div className="text-sm text-slate-300">
              Export simulation UI et génération de rapport (lecture seule).
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={exportAudit}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-2"
                type="button"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={generateReport}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2"
                type="button"
              >
                <FileText className="w-4 h-4" />
                Générer rapport
              </button>
            </div>
            <div className="text-xs text-slate-400">
              Aucun appel API réel. Les fichiers sont générés à partir des données mock.
            </div>
          </div>
        </PrimeCard>

        <PrimeCard title="Vue anomalies">
          <div className="space-y-3">
            <div className="text-sm text-slate-300">
              Anomalies détectées (affichage en lecture seule).
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-navy-900 border border-default p-3">
                <div className="text-xs text-slate-400">Ouvertes</div>
                <div className="text-lg text-amber-300 font-semibold">
                  {dashboard.kpis.anomalies}
                </div>
              </div>
              <div className="rounded-lg bg-navy-900 border border-default p-3">
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-lg text-cyan-300 font-semibold">
                  {dashboard.kpis.anomalies}
                </div>
              </div>
            </div>
          </div>
        </PrimeCard>
      </div>
    </div>
  );
}

