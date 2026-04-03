import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart, CheckCircle2, Eye, GitBranch, Inbox, ScrollText, Shield, X } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../../mockData';
import { useAuditInterfaceNav } from '../../contexts/AuditInterfaceNavContext';
import { enrichAuditRowFromId } from '../../lib/auditOrgUi';

type Severity = 'INFO' | 'WARNING' | 'CRITICAL';
type SortKey = 'datetime' | 'user' | 'action' | 'item' | 'status' | 'departement' | 'pole' | 'cellule' | 'roleMetier' | 'severity';
type SortDir = 'asc' | 'desc';

interface Row {
  id: string;
  datetime: string;
  user: string;
  action: string;
  item: string;
  status: string;
  departement: string;
  pole: string;
  cellule: string;
  roleMetier: string;
  ip: string;
  device: string;
  severity: Severity;
  actionCode: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFIG';
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

interface AccessRow {
  id: string;
  user: string;
  datetime: string;
  ip: string;
  location: string;
  success: boolean;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SUSPICIOUS';
  role: string;
  departement: string;
}

const ROLE_FILTER_OPTIONS = ['Tous', 'RP', 'Manager', 'Coach', 'Pilote'] as const;
const SEVERITY_FILTER_OPTIONS = ['Tous', 'INFO', 'WARNING', 'CRITICAL'] as const;
const ACTION_CHIPS: Array<'Tous' | 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFIG'> = ['Tous', 'CREATE', 'UPDATE', 'DELETE', 'CONFIG'];
const ACCESS_ROWS: AccessRow[] = [
  { id: 'ac1', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:16:05', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'LOGIN_FAILED', role: 'RP', departement: 'RH' },
  { id: 'ac2', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:16:20', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'LOGIN_FAILED', role: 'RP', departement: 'RH' },
  { id: 'ac3', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:16:35', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'LOGIN_FAILED', role: 'RP', departement: 'RH' },
  { id: 'ac4', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:16:52', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'LOGIN_FAILED', role: 'RP', departement: 'RH' },
  { id: 'ac5', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:17:10', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'SUSPICIOUS', role: 'RP', departement: 'RH' },
  { id: 'ac6', user: 'jean.dupont@mykyntus.com', datetime: '2026-03-30 08:12:04', ip: '105.66.12.44', location: 'Casablanca, MA', success: true, type: 'LOGIN_SUCCESS', role: 'Manager', departement: 'Sales' },
  { id: 'ac7', user: 'admin@mykyntus.com', datetime: '2026-03-30 09:15:00', ip: '10.0.0.5', location: 'Réseau interne', success: true, type: 'LOGOUT', role: 'Admin', departement: 'IT' },
];

const toCsv = (headers: string[], data: Array<Array<string | number>>) =>
  [headers.join(';'), ...data.map((d) => d.join(';'))].join('\n');

const downloadFile = (name: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const AuditJournalTable: React.FC<{ title: string }> = ({ title }) => {
  const { section } = useAuditInterfaceNav();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('Tous');
  const [actionFilter, setActionFilter] = useState('Tous');
  const [severityFilter, setSeverityFilter] = useState<(typeof SEVERITY_FILTER_OPTIONS)[number]>('Tous');
  const [actionChip, setActionChip] = useState<(typeof ACTION_CHIPS)[number]>('Tous');
  const [deptFilter, setDeptFilter] = useState('Tous');
  const [poleFilter, setPoleFilter] = useState('Tous');
  const [celluleFilter, setCelluleFilter] = useState('Tous');
  const [roleMetierFilter, setRoleMetierFilter] = useState('Tous');
  const [investigationMode, setInvestigationMode] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('datetime');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Row | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rows: Row[] = useMemo(() => MOCK_AUDIT_LOGS.map((l) => {
    const org = enrichAuditRowFromId(l.id);
    const hash = l.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const actionCode: Row['actionCode'] =
      l.action.toLowerCase().includes('create') ? 'CREATE' :
      l.action.toLowerCase().includes('delete') ? 'DELETE' :
      l.action.toLowerCase().includes('config') ? 'CONFIG' : 'UPDATE';
    const severity: Severity = actionCode === 'DELETE' ? 'CRITICAL' : actionCode === 'UPDATE' ? 'WARNING' : 'INFO';
    return {
      id: l.id,
      datetime: l.timestamp,
      user: l.user,
      action: l.action,
      item: l.documentName,
      status: l.action === 'Approved' ? 'Validé' : 'En attente',
      ip: `105.66.${hash % 200}.${12 + (hash % 40)}`,
      device: ['Chrome / Win11', 'Edge / Win10', 'Firefox / Linux', 'Safari / macOS'][hash % 4],
      severity,
      actionCode,
      beforeState: { document: l.documentName, previousStatus: 'draft' },
      afterState: { document: l.documentName, status: l.action },
      metadata: { id: l.id, source: 'documentation-microservice', timestamp: l.timestamp, actor: l.user },
      ...org,
    };
  }), []);

  useEffect(() => {
    setPoleFilter('Tous');
    setCelluleFilter('Tous');
  }, [deptFilter]);

  useEffect(() => {
    setCelluleFilter('Tous');
  }, [poleFilter]);

  const deptOptions = useMemo(() => ['Tous', ...Array.from(new Set(rows.map((r) => r.departement)))], [rows]);
  const poleOptions = useMemo(() => ['Tous', ...Array.from(new Set(rows.filter((r) => deptFilter === 'Tous' || r.departement === deptFilter).map((r) => r.pole)))], [rows, deptFilter]);
  const celluleOptions = useMemo(() => ['Tous', ...Array.from(new Set(rows.filter((r) => (deptFilter === 'Tous' || r.departement === deptFilter) && (poleFilter === 'Tous' || r.pole === poleFilter)).map((r) => r.cellule)))], [rows, deptFilter, poleFilter]);

  const users = ['Tous', ...Array.from(new Set(rows.map((r) => r.user)))];
  const actions = ['Tous', ...Array.from(new Set(rows.map((r) => r.action)))];

  const resetHierarchyFilters = () => {
    setDeptFilter('Tous');
    setPoleFilter('Tous');
    setCelluleFilter('Tous');
    setRoleMetierFilter('Tous');
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const data = rows.filter((r) => {
      const qOk =
        !q ||
        `${r.datetime} ${r.user} ${r.action} ${r.item} ${r.departement} ${r.pole} ${r.cellule} ${r.roleMetier} ${r.ip} ${r.device}`
          .toLowerCase()
          .includes(q);
      const dOk = !dateFilter || r.datetime.startsWith(dateFilter);
      const uOk = userFilter === 'Tous' || r.user === userFilter;
      const aOk = actionFilter === 'Tous' || r.action === actionFilter;
      const sevOk = severityFilter === 'Tous' || r.severity === severityFilter;
      const chipOk = actionChip === 'Tous' || r.actionCode === actionChip;
      const deptOk = deptFilter === 'Tous' || r.departement === deptFilter;
      const poleOk = poleFilter === 'Tous' || r.pole === poleFilter;
      const cellOk = celluleFilter === 'Tous' || r.cellule === celluleFilter;
      const roleOk = roleMetierFilter === 'Tous' || r.roleMetier === roleMetierFilter;
      return qOk && dOk && uOk && aOk && sevOk && chipOk && deptOk && poleOk && cellOk && roleOk;
    });
    return [...data].sort((a, b) => {
      const va = String(a[sortKey]).toLowerCase();
      const vb = String(b[sortKey]).toLowerCase();
      if (va === vb) return 0;
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [
    rows,
    search,
    dateFilter,
    userFilter,
    actionFilter,
    severityFilter,
    actionChip,
    deptFilter,
    poleFilter,
    celluleFilter,
    roleMetierFilter,
    sortKey,
    sortDir,
  ]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fallbackRows: Row[] = [
    { id: 'mock-1', datetime: '2026-03-27 09:15', user: 'Audit Bot', action: 'Création', item: 'Contrat RH 2026', status: 'En attente', ...enrichAuditRowFromId('mock-1') },
    { id: 'mock-2', datetime: '2026-03-27 10:42', user: 'S. Essbai', action: 'Modification', item: 'Politique interne V2', status: 'En attente', ...enrichAuditRowFromId('mock-2') },
    { id: 'mock-3', datetime: '2026-03-27 11:08', user: 'Comptable', action: 'Validation', item: 'PV validation DOC-19', status: 'Validé', ...enrichAuditRowFromId('mock-3') },
  ];
  const visibleRows = paged.length > 0 ? paged : fallbackRows;
  const hasNoData = rows.length === 0;
  const isMockDisplay = paged.length === 0;

  const showDataTable = section === 'journal' || section === 'reporting';
  const accessRows = useMemo(() => ACCESS_ROWS, []);
  const accessWithFlags = useMemo(() => accessRows.map((r) => {
    const now = new Date(r.datetime.replace(' ', 'T')).getTime();
    const failures = accessRows.filter((x) => x.user === r.user && x.type === 'LOGIN_FAILED').filter((x) => Math.abs(new Date(x.datetime.replace(' ', 'T')).getTime() - now) <= 120000).length;
    return { ...r, bruteForce: failures >= 5, suspicious: r.type === 'SUSPICIOUS' };
  }), [accessRows]);
  const filteredAccess = useMemo(() => accessWithFlags.filter((r) => {
    const qq = search.trim().toLowerCase();
    return !qq || `${r.user} ${r.ip} ${r.location} ${r.role} ${r.departement}`.toLowerCase().includes(qq);
  }), [accessWithFlags, search]);
  const anomalies = useMemo(() => [
    { id: 'a1', title: 'Suppression massive', description: 'Utilisateur Bob Martin a supprimé 10 éléments en 2 min', user: 'Bob Martin', severity: 'CRITICAL' as Severity },
    { id: 'a2', title: 'Accès hors horaires', description: 'Activité à 03:12 pendant un week-end', user: 'sophie.leroy@mykyntus.com', severity: 'WARNING' as Severity },
    { id: 'a3', title: 'IP inhabituelle', description: 'Connexion depuis un pays inhabituel', user: 'unknown@evil.test', severity: 'CRITICAL' as Severity },
  ], []);

  const exportAuditCsv = () => {
    const csv = toCsv(
      ['Date/heure', 'Utilisateur', 'Département', 'Pôle', 'Cellule', 'Rôle', 'Action', 'Élément', 'Statut'],
      filtered.map((r) => [r.datetime, r.user, r.departement, r.pole, r.cellule, r.roleMetier, r.action, r.item, r.status]),
    );
    downloadFile('audit_documentation.csv', csv, 'text/csv;charset=utf-8');
  };

  const exportAuditExcel = () => {
    const tsv = toCsv(
      ['Date/heure', 'Utilisateur', 'Département', 'Pôle', 'Cellule', 'Rôle', 'Action', 'Élément', 'Statut'],
      filtered.map((r) => [r.datetime, r.user, r.departement, r.pole, r.cellule, r.roleMetier, r.action, r.item, r.status]),
    );
    downloadFile('audit_documentation.xls', tsv, 'application/vnd.ms-excel');
  };

  useEffect(() => {
    if (selected) {
      const t = setTimeout(() => setDrawerOpen(true), 10);
      return () => clearTimeout(t);
    }
    setDrawerOpen(false);
    return undefined;
  }, [selected]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir('asc');
    }
  };

  const selClass = 'bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200 min-w-[140px]';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">Tableau audit structuré avec filtres hiérarchiques, tri et pagination.</p>
      </div>
      {section === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-navy p-4 bg-gradient-to-br from-blue-950/40 to-navy-900 border border-blue-900/40 shadow-sm hover:shadow-[0_10px_25px_rgba(37,99,235,0.18)] hover:scale-[1.03] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-300"><Database className="w-4 h-4 text-blue-300" /><p className="text-xs">Nombre total</p></div><p className="text-2xl text-white font-bold mt-2">{rows.length}</p><p className="text-xs text-slate-500">elements audites</p>
          </div>
          <div className="card-navy p-4 bg-gradient-to-br from-emerald-950/35 to-navy-900 border border-emerald-900/40 shadow-sm hover:shadow-[0_10px_25px_rgba(16,185,129,0.16)] hover:scale-[1.03] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-300" /><p className="text-xs">Nombre valide</p></div><p className="text-2xl text-white font-bold mt-2">{rows.filter((r) => r.status === 'Validé').length}</p><p className="text-xs text-slate-500">elements conformes</p>
          </div>
          <div className="card-navy p-4 bg-gradient-to-br from-amber-950/35 to-navy-900 border border-amber-900/40 shadow-sm hover:shadow-[0_10px_25px_rgba(245,158,11,0.16)] hover:scale-[1.03] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-300"><Clock3 className="w-4 h-4 text-amber-300" /><p className="text-xs">Nombre en attente</p></div><p className="text-2xl text-white font-bold mt-2">{rows.filter((r) => r.status !== 'Validé').length}</p><p className="text-xs text-slate-500">verifications a traiter</p>
          </div>
          <div className="card-navy p-4 bg-gradient-to-br from-rose-950/35 to-navy-900 border border-rose-900/40 shadow-sm hover:shadow-[0_10px_25px_rgba(244,63,94,0.16)] hover:scale-[1.03] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-300"><AlertTriangle className="w-4 h-4 text-rose-300" /><p className="text-xs">Nombre d anomalies</p></div><p className="text-2xl text-white font-bold mt-2">3</p><p className="text-xs text-slate-500">points critiques suivis</p>
          </div>
        </div>
      )}

      {section === 'access-history' && (
        <div className="card-navy overflow-hidden border border-navy-800/80">
          <table className="w-full text-sm">
            <thead className="bg-navy-800/55 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Utilisateur</th>
                <th className="px-4 py-3 text-left">Date / heure</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Localisation</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Rôle</th>
                <th className="px-4 py-3 text-left">Département</th>
                <th className="px-4 py-3 text-left">Sécurité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {filteredAccess.map((r) => (
                <tr key={r.id} className="hover:bg-navy-800/30">
                  <td className="px-4 py-3 text-slate-200">{r.user}</td>
                  <td className="px-4 py-3 text-slate-400">{r.datetime}</td>
                  <td className="px-4 py-3 text-slate-300">{r.ip}</td>
                  <td className="px-4 py-3 text-slate-400">{r.location}</td>
                  <td className="px-4 py-3">{r.success ? <span className="text-emerald-300 text-xs">Succès</span> : <span className="text-rose-300 text-xs">Échec</span>}</td>
                  <td className="px-4 py-3 text-slate-300">{r.type.includes('LOGOUT') ? 'Logout' : 'Login'}</td>
                  <td className="px-4 py-3 text-slate-300">{r.role}</td>
                  <td className="px-4 py-3 text-slate-300">{r.departement}</td>
                  <td className="px-4 py-3">
                    {r.bruteForce && <span className="mr-2 px-2 py-0.5 rounded border border-amber-500/50 text-[10px] text-amber-200">Brute force</span>}
                    {r.suspicious && <span className="px-2 py-0.5 rounded border border-rose-500/50 text-[10px] text-rose-200">Tentative suspecte</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'reporting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card-navy p-4"><p className="text-sm text-slate-200">Statistiques globales</p><p className="text-xs text-slate-400 mt-1">Lignes filtrées : {filtered.length} sur {rows.length}</p></div>
          <div className="card-navy p-4"><p className="text-sm text-slate-200">Graphiques</p><p className="text-xs text-slate-400 mt-1">Anomalies et activités (vue synthétique).</p></div>
        </div>
      )}

      {showDataTable && (
        <div className="card-navy p-4 space-y-3 border border-navy-800/80">
          <div className="flex flex-wrap items-end gap-3">
            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className={selClass} aria-label="Département">
              {deptOptions.map((d) => <option key={d} value={d}>{d === 'Tous' ? 'Département' : d}</option>)}
            </select>
            <select value={poleFilter} onChange={(e) => { setPoleFilter(e.target.value); setPage(1); }} className={selClass} disabled={deptFilter === 'Tous'} aria-label="Pôle">
              {poleOptions.map((p) => <option key={p} value={p}>{p === 'Tous' ? 'Pôle' : p}</option>)}
            </select>
            <select value={celluleFilter} onChange={(e) => { setCelluleFilter(e.target.value); setPage(1); }} className={selClass} disabled={deptFilter === 'Tous' || poleFilter === 'Tous'} aria-label="Cellule">
              {celluleOptions.map((c) => <option key={c} value={c}>{c === 'Tous' ? 'Cellule' : c}</option>)}
            </select>
            <select value={roleMetierFilter} onChange={(e) => { setRoleMetierFilter(e.target.value); setPage(1); }} className={selClass} aria-label="Rôle métier">
              {ROLE_FILTER_OPTIONS.map((r) => <option key={r} value={r}>{r === 'Tous' ? 'Rôle' : r}</option>)}
            </select>
            <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value as (typeof SEVERITY_FILTER_OPTIONS)[number]); setPage(1); }} className={selClass} aria-label="Gravité">
              {SEVERITY_FILTER_OPTIONS.map((r) => <option key={r} value={r}>{r === 'Tous' ? 'Gravité' : r}</option>)}
            </select>
            <button type="button" onClick={resetHierarchyFilters} className="px-3 py-2 rounded-lg border border-navy-700 text-sm text-slate-400 hover:bg-navy-800 hover:text-slate-200 whitespace-nowrap">
              Réinitialiser filtres
            </button>
            <button type="button" onClick={() => setInvestigationMode((v) => !v)} className={`px-3 py-2 rounded-lg border text-sm whitespace-nowrap ${investigationMode ? 'border-amber-500/50 text-amber-200 bg-amber-500/10' : 'border-navy-700 text-slate-400 hover:bg-navy-800'}`}>
              Mode investigation
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {ACTION_CHIPS.map((c) => (
              <button key={c} type="button" onClick={() => { setActionChip(c); setPage(1); }} className={`px-2.5 py-1 rounded-full text-xs border ${actionChip === c ? 'bg-blue-600/25 border-blue-500/50 text-blue-200' : 'border-navy-700 text-slate-400'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Recherche" className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200 min-w-[160px]" />
            <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200" />
            <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }} className={selClass}>{users.map((u) => <option key={u}>{u}</option>)}</select>
            <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className={selClass}>{actions.map((a) => <option key={a}>{a}</option>)}</select>
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={exportAuditExcel} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm whitespace-nowrap">Excel</button>
              <button type="button" onClick={exportAuditCsv} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm whitespace-nowrap">CSV</button>
            </div>
          </div>
        </div>
      )}

      {showDataTable && hasNoData && (
        <div className="card-navy p-4 flex items-center gap-3 border border-navy-700/70 bg-navy-900/45">
          <Inbox className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-slate-200 text-sm">Aucune donnee disponible</p>
            <p className="text-xs text-slate-500">Affichage de demonstration avec des lignes mockees.</p>
          </div>
        </div>
      )}

      {showDataTable && (
        <div className="card-navy overflow-hidden border border-navy-800/80">
          <table className="w-full text-sm">
            <thead className="bg-navy-800/55 text-slate-300 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('datetime')}>Date / heure</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('user')}>Utilisateur</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Device</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('severity')}>Gravité</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('departement')}>Département</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('pole')}>Pôle</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('cellule')}>Cellule</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('roleMetier')}>Rôle</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('action')}>Action</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('item')}>Élément</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('status')}>Statut</th>
                <th className="px-4 py-3 text-left">Voir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {visibleRows.map((r) => (
                <tr key={r.id} className="hover:bg-navy-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-400">{r.datetime}</td>
                  <td className="px-4 py-3 text-slate-200">{r.user}</td>
                  <td className="px-4 py-3 text-slate-400">{r.ip}</td>
                  <td className="px-4 py-3 text-slate-400">{r.device}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${r.severity === 'CRITICAL' ? 'border-rose-500/50 text-rose-200' : r.severity === 'WARNING' ? 'border-amber-500/50 text-amber-200' : 'border-emerald-500/50 text-emerald-200'}`}>{r.severity}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.departement}</td>
                  <td className="px-4 py-3 text-slate-400">{r.pole}</td>
                  <td className="px-4 py-3 text-slate-400">{r.cellule}</td>
                  <td className="px-4 py-3 text-slate-200">{r.roleMetier}</td>
                  <td className="px-4 py-3"><span title={`Action technique: ${r.actionCode}`} className="inline-flex px-2 py-0.5 text-xs rounded-md border border-blue-500/30 text-blue-200">{r.action}</span></td>
                  <td className="px-4 py-3 text-slate-300">{r.item}</td>
                  <td className="px-4 py-3 text-slate-300">{r.status}</td>
                  <td className="px-4 py-3"><button type="button" onClick={() => setSelected(r)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-blue-500/30 bg-blue-600/15 hover:bg-blue-500/30 hover:shadow-[0_0_14px_rgba(37,99,235,0.28)] text-blue-200 text-xs transition-all"><Eye className="w-3.5 h-3.5" />Voir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {isMockDisplay && <p className="px-4 py-2 text-[11px] text-slate-500 border-t border-navy-800">Mode mock active (aucune ligne reelle sur ce filtre).</p>}
        </div>
      )}

      {showDataTable && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Page {safePage} / {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-md border border-navy-700 disabled:opacity-40">Précédent</button>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded-md border border-navy-700 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}

      {section === 'anomalies' && (
        <div className="space-y-3">
          {anomalies.map((a) => (
            <div key={a.id} className="card-navy p-4 border border-rose-900/30 bg-rose-950/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-300" />
                  <span className="text-slate-100">{a.title}</span>
                  <span className="px-2 py-0.5 rounded border border-rose-500/50 text-[10px] text-rose-200">{a.severity}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{a.description}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setSection('journal'); setSearch(a.user); }} className="px-3 py-2 rounded-lg border border-blue-500/40 bg-blue-600/15 text-blue-200 text-sm">Investiguer</button>
                <button type="button" onClick={() => setSearch(a.user)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-navy-600 text-slate-300 text-sm"><GitBranch className="w-4 h-4" />Voir timeline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {section === 'reporting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-navy p-4"><p className="text-xs text-slate-500">Actions / jour</p><p className="text-2xl text-white font-bold">{Math.max(1, Math.round(rows.length / 7))}</p></div>
            <div className="card-navy p-4"><p className="text-xs text-slate-500">% actions critiques</p><p className="text-2xl text-rose-300 font-bold">{Math.round((rows.filter((r) => r.severity === 'CRITICAL').length / Math.max(1, rows.length)) * 100)}%</p></div>
            <div className="card-navy p-4"><p className="text-xs text-slate-500">Top 3 utilisateurs</p><p className="text-sm text-slate-200 mt-2">{Array.from(new Set(rows.map((r) => r.user))).slice(0, 3).join(' • ')}</p></div>
          </div>
          <div className="card-navy p-4">
            <div className="flex items-center gap-2 text-slate-300 mb-2"><BarChart className="w-4 h-4" />Graphiques</div>
            <p className="text-sm text-slate-400">Actions par type, activité par jour, répartition par rôle et top utilisateurs.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={exportAuditCsv} className="px-4 py-2 rounded-lg bg-blue-600 text-white">CSV</button>
            <button type="button" onClick={exportAuditExcel} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">PDF/Excel</button>
            <button type="button" onClick={exportAuditCsv} className="px-4 py-2 rounded-lg border border-navy-700 text-slate-300">Rapport mensuel</button>
          </div>
        </div>
      )}

      {selected && section !== 'access-history' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/55">
          <div className={`w-full max-w-md h-full bg-navy-900 border-l border-navy-800 p-5 space-y-4 transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Détail</h4>
              <button type="button" onClick={() => { setDrawerOpen(false); setTimeout(() => setSelected(null), 220); }} className="p-1.5 rounded-md hover:bg-navy-800"><X className="w-4 h-4 text-slate-300" /></button>
            </div>
            <div className="text-sm space-y-3">
              <div><span className="text-slate-500">Département</span><p className="text-slate-200">{selected.departement}</p></div>
              <div><span className="text-slate-500">Pôle</span><p className="text-slate-200">{selected.pole}</p></div>
              <div><span className="text-slate-500">Cellule</span><p className="text-slate-200">{selected.cellule}</p></div>
              <div><span className="text-slate-500">Rôle</span><p className="text-slate-200">{selected.roleMetier}</p></div>
              <div><span className="text-slate-500">Élément</span><p className="text-slate-200">{selected.item}</p></div>
              <div><span className="text-slate-500">Modifié par</span><p className="text-slate-200">{selected.user}</p></div>
              <div><span className="text-slate-500">Date</span><p className="text-slate-200">{selected.datetime}</p></div>
              <div><span className="text-slate-500">Statut</span><p className="text-slate-200">{selected.status}</p></div>
              <div><span className="text-slate-500">IP / Device</span><p className="text-slate-200">{selected.ip} · {selected.device}</p></div>
              <div><span className="text-slate-500">Avant / Après</span><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1"><pre className="p-2 rounded bg-navy-950 text-[11px] text-slate-400 overflow-x-auto">{JSON.stringify(selected.beforeState, null, 2)}</pre><pre className="p-2 rounded bg-navy-950 text-[11px] text-emerald-200 overflow-x-auto">{JSON.stringify(selected.afterState, null, 2)}</pre></div></div>
              <div><span className="text-slate-500">Metadata</span><pre className="mt-1 p-2 rounded bg-navy-950 text-[11px] text-slate-400 overflow-x-auto">{JSON.stringify(selected.metadata, null, 2)}</pre></div>
              <button type="button" onClick={() => { setSearch(selected.user); setSelected(null); }} className="w-full py-2 rounded-lg border border-blue-500/40 bg-blue-600/15 text-blue-200 text-sm">Voir toutes les actions de cet utilisateur</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
