import React from 'react';
import {
  ACTIONS_BY_ROLE,
  ACTIONS_BY_TYPE,
  ACTIVITY_BY_DAY,
  REPORTING_KPIS,
  TOP_ACTIVE_USERS,
} from './auditDemoData';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

function PieChartSimple() {
  const total = ACTIONS_BY_TYPE.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  const segments = ACTIONS_BY_TYPE.map((x) => {
    const start = (acc / total) * 360;
    acc += x.value;
    const end = (acc / total) * 360;
    return { ...x, start, end };
  });
  const gradient = segments.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(', ');

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div
        className="w-36 h-36 rounded-full shrink-0 border border-navy-700 shadow-inner transition-transform hover:scale-105 duration-300"
        style={{ background: `conic-gradient(${gradient})` }}
        title="Répartition par type d’action"
      />
      <ul className="space-y-2 text-sm text-slate-300">
        {ACTIONS_BY_TYPE.map((x) => (
          <li key={x.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: x.color }} />
            {x.label} — {x.value}%
          </li>
        ))}
      </ul>
    </div>
  );
}

function LineActivityChart() {
  const max = Math.max(...ACTIVITY_BY_DAY.map((d) => d.v), 1);
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">Activité par jour (volume d’événements)</p>
      <div className="flex items-end gap-2 h-36">
        {ACTIVITY_BY_DAY.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-gradient-to-t from-blue-600/80 to-blue-400/40 min-h-[4px] transition-all duration-300 hover:from-blue-500/90"
              style={{ height: `${(d.v / max) * 100}%` }}
              title={`${d.v} événements`}
            />
            <span className="text-[10px] text-slate-500">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const toCsv = (headers: string[], data: Array<Array<string | number>>) =>
  [headers.join(';'), ...data.map((d) => d.join(';'))].join('\n');

const download = (name: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const ReportingDashboard: React.FC = () => {
  const exportPdfHtml = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Rapport audit — PDF</title>
<style>body{font-family:system-ui;padding:24px;background:#0f172a;color:#e2e8f0;} h1{color:#93c5fd;} table{border-collapse:collapse;width:100%;margin-top:16px;} td,th{border:1px solid #334155;padding:8px;text-align:left;font-size:12px;}</style></head><body>
<h1>Rapport analytique — Audit Parrainage</h1>
<p>Période : mars 2026 (démo)</p>
<table>
<tr><th>Indicateur</th><th>Valeur</th></tr>
<tr><td>Total actions</td><td>${REPORTING_KPIS.totalActions}</td></tr>
<tr><td>Actions / jour (moy.)</td><td>${REPORTING_KPIS.actionsPerDay}</td></tr>
<tr><td>% actions critiques</td><td>${REPORTING_KPIS.criticalPercent}%</td></tr>
<tr><td>Utilisateurs actifs</td><td>${REPORTING_KPIS.activeUsers}</td></tr>
<tr><td>Anomalies détectées</td><td>${REPORTING_KPIS.anomaliesCount}</td></tr>
<tr><td>Top utilisateur</td><td>${REPORTING_KPIS.topUser} (${REPORTING_KPIS.topUserActions} actions)</td></tr>
</table>
<p style="margin-top:24px;font-size:11px;color:#64748b;">Ouvrez via le navigateur puis Fichier → Imprimer → Enregistrer au format PDF.</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rapport-audit-parrainage.html';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportExcel = () => {
    const tsv = toCsv(
      ['Indicateur', 'Valeur'],
      [
        ['Total actions', REPORTING_KPIS.totalActions],
        ['Actions / jour (moy.)', REPORTING_KPIS.actionsPerDay],
        ['% critiques', REPORTING_KPIS.criticalPercent],
        ['Utilisateurs actifs', REPORTING_KPIS.activeUsers],
        ['Anomalies', REPORTING_KPIS.anomaliesCount],
        ['Top utilisateur', REPORTING_KPIS.topUser],
      ],
    );
    download('synthese-audit.xls', tsv, 'application/vnd.ms-excel');
  };

  const exportMonthlyCsv = () => {
    const csv = toCsv(
      ['Semaine', 'Jour', 'Volume'],
      ACTIVITY_BY_DAY.map((d, i) => [`S12-2026`, d.day, d.v]),
    );
    download('activite-mensuelle-audit.csv', csv, 'text/csv;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-navy p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Total actions</p>
          <p className="text-2xl font-bold text-white mt-1">{REPORTING_KPIS.totalActions.toLocaleString('fr-FR')}</p>
        </div>
        <div className="card-navy p-4 border border-rose-500/20 hover:border-rose-500/40 transition-colors">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">% actions critiques</p>
          <p className="text-2xl font-bold text-rose-300 mt-1">{REPORTING_KPIS.criticalPercent}%</p>
        </div>
        <div className="card-navy p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Utilisateurs actifs</p>
          <p className="text-2xl font-bold text-emerald-200 mt-1">{REPORTING_KPIS.activeUsers}</p>
        </div>
        <div className="card-navy p-4 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Anomalies détectées</p>
          <p className="text-2xl font-bold text-amber-200 mt-1">{REPORTING_KPIS.anomaliesCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-navy p-4 border border-slate-600/30">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Actions / jour (moy.)</p>
          <p className="text-2xl font-bold text-white mt-1">{REPORTING_KPIS.actionsPerDay}</p>
        </div>
        <div className="card-navy p-4 border border-slate-600/30 sm:col-span-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Utilisateur le plus actif</p>
          <p className="text-lg font-semibold text-emerald-200 mt-1 truncate">{REPORTING_KPIS.topUser}</p>
          <p className="text-xs text-slate-500">{REPORTING_KPIS.topUserActions} actions</p>
        </div>
        <div className="card-navy p-4 border border-violet-500/20 flex flex-col justify-center gap-2">
          <button
            type="button"
            onClick={exportPdfHtml}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-white text-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            Rapport PDF (HTML)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-navy-600 text-slate-300 text-sm hover:bg-navy-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Imprimer / PDF
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-emerald-600/50 text-emerald-200 text-sm hover:bg-emerald-950/40 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel (synthèse)
          </button>
          <button
            type="button"
            onClick={exportMonthlyCsv}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-navy-600 text-slate-400 text-xs hover:bg-navy-800 transition-colors"
          >
            Export CSV activité
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-navy p-5 border border-navy-800/80">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Actions par type</h3>
          <PieChartSimple />
        </div>
        <div className="card-navy p-5 border border-navy-800/80">
          <LineActivityChart />
        </div>
      </div>

      <div className="card-navy p-5 border border-navy-800/80">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Répartition par rôle</h3>
        <div className="space-y-2">
          {ACTIONS_BY_ROLE.map((r) => (
            <div key={r.role} className="flex items-center gap-3">
              <span className="w-24 text-xs text-slate-400">{r.role}</span>
              <div className="flex-1 h-2 rounded-full bg-navy-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-soft-blue to-blue-400 transition-all duration-500" style={{ width: `${r.pct}%` }} />
              </div>
              <span className="w-10 text-xs text-slate-500 text-right">{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-navy p-5 border border-navy-800/80">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Top utilisateurs actifs</h3>
        <div className="space-y-2">
          {TOP_ACTIVE_USERS.map((u, i) => (
            <div key={u.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-400 w-6">{i + 1}.</span>
              <span className="flex-1 text-slate-200 truncate">{u.name}</span>
              <span className="text-slate-500 tabular-nums">{u.actions}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
