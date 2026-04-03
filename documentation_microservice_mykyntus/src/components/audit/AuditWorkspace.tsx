import React, { useMemo, useState } from 'react';
import { ICONS } from '../../types';
import { AlertTriangle, CheckCircle2, Clock3, Database, RefreshCcw } from 'lucide-react';
import { MOCK_AUDIT_LOGS, MOCK_DOCUMENTS, MOCK_REQUESTS } from '../../mockData';
import { AuditKpiCard } from './AuditKpiCard';
import { AuditTimeline } from './AuditTimeline';
import { AuditAlertCard } from './AuditAlertCard';

type AuditSection = 'dashboard' | 'trail' | 'detail' | 'anomalies' | 'reporting';

interface AuditWorkspaceProps {
  initialSection?: AuditSection;
}

const toCsv = (headers: string[], rows: Array<Array<string | number>>) =>
  [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

const downloadFile = (name: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const AuditWorkspace: React.FC<AuditWorkspaceProps> = ({ initialSection = 'dashboard' }) => {
  const [section, setSection] = useState<AuditSection>(initialSection);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_AUDIT_LOGS[0]?.id ?? null);

  const rows = useMemo(
    () =>
      MOCK_AUDIT_LOGS.map((l) => ({
        id: l.id,
        datetime: l.timestamp,
        user: l.user,
        action: l.action,
        item: l.documentName,
        before: '-',
        after: l.action === 'Approved' ? 'Approved' : l.action,
        status: l.action === 'Approved' ? 'Validé' : 'En attente',
      })),
    [],
  );

  const filteredRows = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const qOk = !q || `${r.user} ${r.action} ${r.item}`.toLowerCase().includes(q);
    const uOk = userFilter === 'Tous' || r.user === userFilter;
    const sOk = statusFilter === 'Tous' || r.status === statusFilter;
    return qOk && uOk && sOk;
  });

  const selected = filteredRows.find((r) => r.id === selectedId) ?? filteredRows[0];
  const users = ['Tous', ...Array.from(new Set(rows.map((r) => r.user)))];
  const validCount = rows.filter((r) => r.status === 'Validé').length;
  const pendingCount = rows.filter((r) => r.status === 'En attente').length;

  const anomalies = [
    { id: 'A-001', type: 'Document expiré', severity: 'Critique', status: 'Ouvert', followup: 'Relance RH lancée' },
    { id: 'A-002', type: 'Document manquant', severity: 'Majeur', status: 'En cours', followup: 'Collecte en cours' },
    { id: 'A-003', type: 'Version incorrecte', severity: 'Moyen', status: 'Résolu', followup: 'Version corrigée' },
  ];

  const exportTrailCsv = () => {
    const csv = toCsv(
      ['Date/Heure', 'Utilisateur', 'Action', 'Element', 'Avant', 'Apres', 'Statut'],
      filteredRows.map((r) => [r.datetime, r.user, r.action, r.item, r.before, r.after, r.status]),
    );
    downloadFile('audit_trail_documentation.csv', csv, 'text/csv;charset=utf-8');
  };

  const exportTrailExcel = () => {
    const tsv = toCsv(
      ['Date/Heure', 'Utilisateur', 'Action', 'Element', 'Avant', 'Apres', 'Statut'],
      filteredRows.map((r) => [r.datetime, r.user, r.action, r.item, r.before, r.after, r.status]),
    );
    downloadFile('audit_trail_documentation.xls', tsv, 'application/vnd.ms-excel');
  };

  return (
    <div className="space-y-6">
      {section === 'dashboard' && (
        <div className="space-y-8">
          <div className="card-navy p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Vue globale des activités audit</h3>
              <p className="text-sm text-slate-500">Suivi consolidé des contrôles, validations et anomalies.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={exportTrailCsv} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors">Export</button>
              <button type="button" className="px-3 py-2 rounded-lg border border-navy-700 bg-navy-900 text-slate-200 text-sm flex items-center gap-1.5 transition-colors hover:bg-navy-800"><RefreshCcw className="w-4 h-4" />Rafraîchir</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AuditKpiCard title="Nombre total d’éléments" value={rows.length} subtitle={`${rows.length} éléments audités`} trend="+12% vs période précédente" icon={<Database className="w-4 h-4" />} accent="blue" />
            <AuditKpiCard title="Nombre validé" value={validCount} subtitle={`${validCount} validations confirmées`} trend="+6% vs période précédente" icon={<CheckCircle2 className="w-4 h-4" />} accent="green" />
            <AuditKpiCard title="Nombre en attente" value={pendingCount} subtitle={`${pendingCount} éléments en attente`} trend="-2% vs période précédente" icon={<Clock3 className="w-4 h-4" />} accent="amber" />
            <AuditKpiCard title="Nombre d’anomalies" value={anomalies.length} subtitle={`${anomalies.length} anomalies détectées`} trend="+1 vs période précédente" icon={<AlertTriangle className="w-4 h-4" />} accent="rose" />
          </div>

          <div className="card-navy p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><ICONS.Activity className="w-4 h-4 text-blue-400" />Activité récente</h3>
            <AuditTimeline items={rows.slice(0, 8).map((r) => ({ id: r.id, action: r.action, item: r.item, datetime: r.datetime }))} />
          </div>

          <div className="card-navy p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-300" />Alertes visibles</h3>
            <AuditAlertCard level="Critique" message="Document expiré détecté: Contrat employé #D-204" />
            <AuditAlertCard level="Moyen" message="Document manquant: Pièce identité #D-118" />
          </div>
        </div>
      )}

      {section === 'trail' && (
        <div className="space-y-4">
          <div className="card-navy p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Recherche rapide" className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200" />
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200">
              {users.map((u) => <option key={u}>{u}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200">
              <option>Tous</option><option>Validé</option><option>En attente</option>
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={exportTrailCsv} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm">Export CSV</button>
              <button type="button" onClick={exportTrailExcel} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm">Export Excel</button>
            </div>
          </div>
          <div className="card-navy overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-800/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Date / heure</th><th className="px-4 py-3 text-left">Utilisateur</th><th className="px-4 py-3 text-left">Action</th><th className="px-4 py-3 text-left">Element</th><th className="px-4 py-3 text-left">Avant / apres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-navy-800/30 cursor-pointer" onClick={() => { setSelectedId(r.id); setSection('detail'); }}>
                    <td className="px-4 py-3 text-slate-400">{r.datetime}</td>
                    <td className="px-4 py-3 text-slate-200">{r.user}</td>
                    <td className="px-4 py-3 text-slate-200">{r.action}</td>
                    <td className="px-4 py-3 text-slate-300">{r.item}</td>
                    <td className="px-4 py-3 text-slate-400">{r.before} {'->'} {r.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'detail' && selected && (
        <div className="card-navy p-5 space-y-4">
          <h3 className="text-lg font-semibold text-white">Fiche détail</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Element</span><p className="text-slate-200">{selected.item}</p></div>
            <div><span className="text-slate-500">Statut</span><p className="text-slate-200">{selected.status}</p></div>
            <div><span className="text-slate-500">Modifie par</span><p className="text-slate-200">{selected.user}</p></div>
            <div><span className="text-slate-500">Date</span><p className="text-slate-200">{selected.datetime}</p></div>
          </div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Historique des actions</p>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>Creation du document</li><li>Validation RH</li><li>Mise a jour meta-donnees</li>
            </ul>
          </div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Commentaires audit</p>
            <textarea className="w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-slate-200" rows={3} defaultValue="Conforme, verification completee." />
          </div>
        </div>
      )}

      {section === 'anomalies' && (
        <div className="card-navy overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-800/50 text-slate-500">
              <tr><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Gravite</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-left">Suivi resolution</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {anomalies.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-slate-200">{a.type}</td>
                  <td className="px-4 py-3 text-slate-300">{a.severity}</td>
                  <td className="px-4 py-3 text-slate-300">{a.status}</td>
                  <td className="px-4 py-3 text-slate-400">{a.followup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'reporting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-navy p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Repartition des anomalies</h3>
              <p className="text-sm text-slate-400">Critique: 1 · Majeur: 1 · Moyen: 1</p>
            </div>
            <div className="card-navy p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Statistiques globales</h3>
              <p className="text-sm text-slate-400">Taux conformite: 94% · Actions auditees: {rows.length}</p>
            </div>
          </div>
          <div className="card-navy p-4 flex gap-2">
            <button type="button" onClick={exportTrailCsv} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Export CSV</button>
            <button type="button" onClick={() => downloadFile('reporting_audit_documentation.pdf', 'Reporting audit documentation', 'application/pdf')} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Export PDF</button>
          </div>
          <div className="card-navy p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Controle metier documentation</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>Documents crees / modifies / supprimes audites</li>
              <li>Detection documents expires et manquants</li>
              <li>Detection versions incorrectes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
