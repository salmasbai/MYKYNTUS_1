import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Database, Eye, GitBranch, Inbox, Shield, X } from 'lucide-react';
import { type AuditSection, usePrimeSection } from '../../contexts/PrimeSectionContext';
import { AuditPrimeService } from '../../services/audit-prime.service';
import type { AuditOperation } from '../../mock-data/audit';
import { enrichAuditRowFromId, getAuditOrgTree } from '../../lib/auditOrgUi';

type SeverityLevel = 'INFO' | 'WARNING' | 'CRITICAL';
type SortKey = 'date' | 'employee' | 'action' | 'item' | 'status' | 'departement' | 'pole' | 'cellule' | 'roleMetier' | 'severity';
type SortDir = 'asc' | 'desc';

interface JournalRow {
  id: string;
  date: string;
  employee: string;
  action: string;
  item: string;
  status: string;
  departement: string;
  pole: string;
  cellule: string;
  roleMetier: string;
  ip: string;
  device: string;
  severity: SeverityLevel;
  actionCode: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFIG';
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

const toCsv = (headers: string[], rows: Array<Array<string | number>>) => [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
const downloadFile = (name: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

const actionBadge = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes('création') || a.includes('create')) return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  if (a.includes('modification') || a.includes('modif')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (a.includes('validation') || a.includes('valid')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (a.includes('suppression') || a.includes('suppr')) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
};

const auditPageTitles: Partial<Record<AuditSection, string>> = {
  dashboard: 'Dashboard audit',
  journal: 'Journal d’audit',
  anomalies: 'Anomalies',
  reporting: 'Reporting',
  'access-history': 'Historique d’accès',
};

const ORG = getAuditOrgTree();
const ROLE_FILTER_OPTIONS = ['Tous', 'RP', 'Manager', 'Coach', 'Pilote'] as const;
const SEVERITY_OPTIONS = ['Tous', 'INFO', 'WARNING', 'CRITICAL'] as const;
const ACTION_CHIPS = ['Tous', 'CREATE', 'UPDATE', 'DELETE', 'CONFIG'] as const;

export function AuditRoot() {
  const { activeAuditSection } = usePrimeSection();
  const [operations, setOperations] = useState<AuditOperation[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('Tous');
  const [actionFilter, setActionFilter] = useState('Tous');
  const [deptFilter, setDeptFilter] = useState('Tous');
  const [poleFilter, setPoleFilter] = useState('Tous');
  const [celluleFilter, setCelluleFilter] = useState('Tous');
  const [roleMetierFilter, setRoleMetierFilter] = useState<string>('Tous');
  const [severityFilter, setSeverityFilter] = useState<(typeof SEVERITY_OPTIONS)[number]>('Tous');
  const [actionChip, setActionChip] = useState<(typeof ACTION_CHIPS)[number]>('Tous');
  const [investigationMode, setInvestigationMode] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<JournalRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timelineUser, setTimelineUser] = useState<string | null>(null);

  useEffect(() => { AuditPrimeService.getOperations().then(setOperations); }, []);

  useEffect(() => {
    setPoleFilter('Tous');
    setCelluleFilter('Tous');
  }, [deptFilter]);

  useEffect(() => {
    setCelluleFilter('Tous');
  }, [poleFilter]);

  const rows: JournalRow[] = useMemo(() => operations.map((o) => {
    const org = enrichAuditRowFromId(o.id);
    const hash = o.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const actionCode: JournalRow['actionCode'] = o.status === 'Rejeté' ? 'DELETE' : o.status === 'Validé' ? 'UPDATE' : 'CREATE';
    const severity: SeverityLevel = actionCode === 'DELETE' ? 'CRITICAL' : actionCode === 'UPDATE' ? 'WARNING' : 'INFO';
    return {
      id: o.id,
      date: o.date,
      employee: o.employeeName,
      action: o.status === 'Validé' ? 'Validation' : o.status === 'Rejeté' ? 'Suppression' : 'Modification',
      item: o.projectName,
      status: o.status,
      ip: `105.66.${hash % 200}.${12 + (hash % 40)}`,
      device: ['Chrome / Win11', 'Edge / Win10', 'Firefox / Linux', 'Safari / macOS'][hash % 4],
      severity,
      actionCode,
      beforeState: { status: 'before', project: o.projectName, validatedBy: o.validatedBy },
      afterState: { status: o.status, project: o.projectName, validatedBy: o.validatedBy },
      metadata: { source: 'prime-microservice', id: o.id, date: o.date },
      ...org,
    };
  }), [operations]);

  const deptOptions = useMemo(() => ['Tous', ...ORG.map((d) => d.dept)], []);
  const poleOptions = useMemo(() => {
    if (deptFilter === 'Tous') return ['Tous'];
    const d = ORG.find((x) => x.dept === deptFilter);
    return ['Tous', ...(d?.poles.map((p) => p.name) ?? [])];
  }, [deptFilter]);
  const celluleOptions = useMemo(() => {
    if (deptFilter === 'Tous' || poleFilter === 'Tous') return ['Tous'];
    const d = ORG.find((x) => x.dept === deptFilter);
    const p = d?.poles.find((x) => x.name === poleFilter);
    return ['Tous', ...(p?.cellules ?? [])];
  }, [deptFilter, poleFilter]);

  const users = ['Tous', ...Array.from(new Set(rows.map((r) => r.employee)))];
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
      const qOk = !q || `${r.date} ${r.employee} ${r.action} ${r.item} ${r.departement} ${r.pole} ${r.cellule} ${r.roleMetier} ${r.ip} ${r.device}`.toLowerCase().includes(q);
      const dOk = !dateFilter || r.date.startsWith(dateFilter);
      const uOk = userFilter === 'Tous' || r.employee === userFilter;
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
  }, [rows, search, dateFilter, userFilter, actionFilter, severityFilter, actionChip, deptFilter, poleFilter, celluleFilter, roleMetierFilter, sortKey, sortDir]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fallbackRows: JournalRow[] = [
    { id: 'mock-1', date: '2026-03-27 08:45', employee: 'Audit Bot', action: 'Validation', item: 'Prime T1 - Equipe A', status: 'Validé', ...enrichAuditRowFromId('mock-1') },
    { id: 'mock-2', date: '2026-03-27 09:31', employee: 'Comptable', action: 'Modification', item: 'Prime commerciale', status: 'En attente', ...enrichAuditRowFromId('mock-2') },
    { id: 'mock-3', date: '2026-03-27 10:12', employee: 'RH Prime', action: 'Suppression', item: 'Prime obsolete', status: 'Rejeté', ...enrichAuditRowFromId('mock-3') },
  ];
  const visibleRows = paged.length > 0 ? paged : fallbackRows;
  const hasNoData = rows.length === 0;
  const isMockDisplay = paged.length === 0;

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
    else { setSortKey(k); setSortDir('asc'); }
  };

  const exportCsv = () => {
    const exportRows = filtered.filter((r) => r.status === 'Validé');
    const csv = toCsv(
      ['Employé', 'Département', 'Pôle', 'Cellule', 'Rôle', 'Montant', 'Type de prime', 'Date validation', 'Statut'],
      exportRows.map((r) => [r.employee, r.departement, r.pole, r.cellule, r.roleMetier, 1200, 'Prime performance', r.date, r.status]),
    );
    downloadFile('prime_validees_audit.csv', csv, 'text/csv;charset=utf-8');
  };
  const exportExcel = () => {
    const exportRows = filtered.filter((r) => r.status === 'Validé');
    const tsv = toCsv(
      ['Employé', 'Département', 'Pôle', 'Cellule', 'Rôle', 'Montant', 'Type de prime', 'Date validation', 'Statut'],
      exportRows.map((r) => [r.employee, r.departement, r.pole, r.cellule, r.roleMetier, 1200, 'Prime performance', r.date, r.status]),
    );
    downloadFile('prime_validees_audit.xls', tsv, 'application/vnd.ms-excel');
  };

  const title = auditPageTitles[activeAuditSection] ?? 'Journal d’audit';
  const showDataTable = activeAuditSection === 'journal';
  const accessRows = [
    { id: 'acc-1', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:16:05', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'LOGIN_FAILED', role: 'RP', departement: 'RH' },
    { id: 'acc-2', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:16:20', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'LOGIN_FAILED', role: 'RP', departement: 'RH' },
    { id: 'acc-3', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:16:35', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'LOGIN_FAILED', role: 'RP', departement: 'RH' },
    { id: 'acc-4', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:16:55', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'LOGIN_FAILED', role: 'RP', departement: 'RH' },
    { id: 'acc-5', user: 'sophie.leroy@mykyntus.com', datetime: '2026-03-30 09:17:05', ip: '105.66.12.99', location: 'Casablanca, MA', success: false, type: 'SUSPICIOUS', role: 'RP', departement: 'RH' },
    { id: 'acc-6', user: 'jean.dupont@mykyntus.com', datetime: '2026-03-30 08:12:04', ip: '105.66.12.44', location: 'Casablanca, MA', success: true, type: 'LOGIN_SUCCESS', role: 'Manager', departement: 'Sales' },
    { id: 'acc-7', user: 'admin@mykyntus.com', datetime: '2026-03-30 09:15:00', ip: '10.0.0.5', location: 'Réseau interne', success: true, type: 'LOGOUT', role: 'Admin', departement: 'IT' },
  ];

  const filterBarClass = 'bg-app border border-default rounded-lg px-3 py-2 text-sm text-primary';
  const orgSelectClass = 'bg-app border border-default rounded-lg px-3 py-2 text-sm text-primary min-w-[140px]';

  return (
    <div className="p-8 bg-navy-950 min-h-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-slate-400 mt-1">Tableau structuré avec filtres hiérarchiques, tri, pagination et fiche dans le panneau latéral.</p>
      </div>

      {activeAuditSection === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-default rounded-xl p-4 bg-gradient-to-br from-blue-950/35 to-app shadow-sm hover:shadow-[0_10px_25px_rgba(37,99,235,0.18)] hover:scale-[1.03] transition-all duration-300">
            <div className="flex items-center gap-2 text-muted"><Database className="w-4 h-4 text-blue-300" /><p className="text-xs">Nombre total</p></div><p className="text-2xl text-primary font-bold mt-2">{rows.length}</p><p className="text-xs text-muted">elements audites</p>
          </div>
          <div className="bg-card border border-default rounded-xl p-4 bg-gradient-to-br from-emerald-950/30 to-app shadow-sm hover:shadow-[0_10px_25px_rgba(16,185,129,0.16)] hover:scale-[1.03] transition-all duration-300">
            <div className="flex items-center gap-2 text-muted"><CheckCircle2 className="w-4 h-4 text-emerald-300" /><p className="text-xs">Nombre valide</p></div><p className="text-2xl text-primary font-bold mt-2">{rows.filter((r) => r.status === 'Validé').length}</p><p className="text-xs text-muted">primes conformes</p>
          </div>
          <div className="bg-card border border-default rounded-xl p-4 bg-gradient-to-br from-amber-950/30 to-app shadow-sm hover:shadow-[0_10px_25px_rgba(245,158,11,0.16)] hover:scale-[1.03] transition-all duration-300">
            <div className="flex items-center gap-2 text-muted"><Clock3 className="w-4 h-4 text-amber-300" /><p className="text-xs">Nombre en attente</p></div><p className="text-2xl text-primary font-bold mt-2">{rows.filter((r) => r.status !== 'Validé').length}</p><p className="text-xs text-muted">dossiers a valider</p>
          </div>
          <div className="bg-card border border-default rounded-xl p-4 bg-gradient-to-br from-rose-950/30 to-app shadow-sm hover:shadow-[0_10px_25px_rgba(244,63,94,0.16)] hover:scale-[1.03] transition-all duration-300">
            <div className="flex items-center gap-2 text-muted"><AlertTriangle className="w-4 h-4 text-rose-300" /><p className="text-xs">Nombre d anomalies</p></div><p className="text-2xl text-primary font-bold mt-2">3</p><p className="text-xs text-muted">alertes critiques</p>
          </div>
        </div>
      )}

      {showDataTable && activeAuditSection === 'reporting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-card border border-default rounded-xl p-4"><p className="text-sm text-primary">Statistiques globales</p><p className="text-xs text-muted mt-1">Lignes filtrées: {filtered.length} sur {rows.length}</p></div>
          <div className="bg-card border border-default rounded-xl p-4"><p className="text-sm text-primary">Graphiques</p><p className="text-xs text-muted mt-1">Anomalies et activités (synthèse)</p></div>
        </div>
      )}

      {showDataTable && (
        <div className="space-y-3">
          <div className="bg-card border border-default rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className={orgSelectClass} aria-label="Département">
                {deptOptions.map((d) => <option key={d} value={d}>{d === 'Tous' ? 'Département' : d}</option>)}
              </select>
              <select value={poleFilter} onChange={(e) => { setPoleFilter(e.target.value); setPage(1); }} className={orgSelectClass} disabled={deptFilter === 'Tous'} aria-label="Pôle">
                {poleOptions.map((p) => <option key={p} value={p}>{p === 'Tous' ? 'Pôle' : p}</option>)}
              </select>
              <select value={celluleFilter} onChange={(e) => { setCelluleFilter(e.target.value); setPage(1); }} className={orgSelectClass} disabled={deptFilter === 'Tous' || poleFilter === 'Tous'} aria-label="Cellule">
                {celluleOptions.map((c) => <option key={c} value={c}>{c === 'Tous' ? 'Cellule' : c}</option>)}
              </select>
              <select value={roleMetierFilter} onChange={(e) => { setRoleMetierFilter(e.target.value); setPage(1); }} className={orgSelectClass} aria-label="Rôle métier">
                {ROLE_FILTER_OPTIONS.map((r) => <option key={r} value={r}>{r === 'Tous' ? 'Rôle' : r}</option>)}
              </select>
              <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value as (typeof SEVERITY_OPTIONS)[number]); setPage(1); }} className={orgSelectClass} aria-label="Gravité">
                {SEVERITY_OPTIONS.map((r) => <option key={r} value={r}>{r === 'Tous' ? 'Gravité' : r}</option>)}
              </select>
              <button type="button" onClick={resetHierarchyFilters} className="px-3 py-2 rounded-lg border border-default text-sm text-muted hover:bg-app hover:text-primary whitespace-nowrap">
                Réinitialiser filtres
              </button>
              <button type="button" onClick={() => setInvestigationMode((v) => !v)} className={`px-3 py-2 rounded-lg border text-sm whitespace-nowrap ${investigationMode ? 'border-amber-500/50 text-amber-200 bg-amber-500/10' : 'border-default text-muted'}`}>
                Mode investigation
              </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {ACTION_CHIPS.map((c) => (
                <button key={c} type="button" onClick={() => { setActionChip(c); setPage(1); }} className={`px-2.5 py-1 rounded-full text-xs border ${actionChip === c ? 'bg-blue-600/25 border-blue-500/50 text-blue-200' : 'border-default text-muted'}`}>{c}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Recherche" className={`${filterBarClass} min-w-[160px]`} />
              <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className={filterBarClass} />
              <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }} className={orgSelectClass}>{users.map((u) => <option key={u}>{u}</option>)}</select>
              <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className={orgSelectClass}>{actions.map((a) => <option key={a}>{a}</option>)}</select>
              <div className="flex gap-2 ml-auto">
                <button type="button" onClick={exportExcel} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm whitespace-nowrap">Excel</button>
                <button type="button" onClick={exportCsv} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm whitespace-nowrap">CSV</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDataTable && hasNoData && (
        <div className="bg-card border border-default rounded-xl p-4 flex items-center gap-3">
          <Inbox className="w-5 h-5 text-muted" />
          <div>
            <p className="text-primary text-sm">Aucune donnee disponible</p>
            <p className="text-xs text-muted">Affichage de demonstration avec des lignes mockees.</p>
          </div>
        </div>
      )}

      {showDataTable && (
        <div className="bg-card border border-default rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-app/60 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('date')}>Date / heure</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => toggleSort('employee')}>Utilisateur</th>
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
            <tbody className="divide-y divide-default">
              {visibleRows.map((r) => (
                <tr key={r.id} className="hover:bg-app/40 transition-colors">
                  <td className="px-4 py-3 text-muted">{r.date}</td>
                  <td className="px-4 py-3 text-primary">{r.employee}</td>
                  <td className="px-4 py-3 text-muted">{r.ip}</td>
                  <td className="px-4 py-3 text-muted">{r.device}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] border ${r.severity === 'CRITICAL' ? 'border-rose-500/50 text-rose-200' : r.severity === 'WARNING' ? 'border-amber-500/50 text-amber-200' : 'border-emerald-500/50 text-emerald-200'}`}>{r.severity}</span></td>
                  <td className="px-4 py-3 text-muted">{r.departement}</td>
                  <td className="px-4 py-3 text-muted">{r.pole}</td>
                  <td className="px-4 py-3 text-muted">{r.cellule}</td>
                  <td className="px-4 py-3 text-primary">{r.roleMetier}</td>
                  <td className="px-4 py-3"><span title={`Action technique: ${r.actionCode}`} className="inline-flex px-2 py-0.5 text-xs rounded-md border border-blue-500/30 text-blue-200">{r.action}</span></td>
                  <td className="px-4 py-3 text-muted">{r.item}</td>
                  <td className="px-4 py-3 text-primary">{r.status}</td>
                  <td className="px-4 py-3"><button type="button" onClick={() => setSelected(r)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-blue-500/30 bg-blue-600/15 hover:bg-blue-500/30 hover:shadow-[0_0_14px_rgba(37,99,235,0.28)] text-blue-200 text-xs transition-all"><Eye className="w-3.5 h-3.5" />Voir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {isMockDisplay && <p className="px-4 py-2 text-[11px] text-muted border-t border-default">Mode mock actif (aucune ligne reelle sur ce filtre).</p>}
        </div>
      )}

      {showDataTable && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Page {safePage} / {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-md border border-default disabled:opacity-40">Précédent</button>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded-md border border-default disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}

      {activeAuditSection === 'anomalies' && (
        <div className="space-y-3">
          <div className="bg-card border border-default rounded-xl p-4 flex items-center gap-2 text-sm text-muted"><AlertTriangle className="w-4 h-4 text-rose-300" />Suppression massive, accès hors horaires et IP inhabituelle détectés.</div>
          {[{ id: 'a1', text: 'Utilisateur Bob Martin a supprimé 10 éléments en 2 min', user: 'Bob Martin', severity: 'CRITICAL' }, { id: 'a2', text: 'Connexion depuis IP/pays inhabituel pour ce compte', user: 'unknown@evil.test', severity: 'CRITICAL' }, { id: 'a3', text: 'Activité audit en dehors des horaires (week-end)', user: 'sophie.leroy@mykyntus.com', severity: 'WARNING' }].map((a) => (
            <div key={a.id} className="bg-card border border-rose-900/40 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="text-sm text-primary">
                <span className={`inline-block mr-2 px-2 py-0.5 rounded text-[10px] border ${a.severity === 'CRITICAL' ? 'border-rose-500/50 text-rose-200' : 'border-amber-500/50 text-amber-200'}`}>{a.severity}</span>
                {a.text}
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => { setSearch(a.user); setPage(1); }} className="px-3 py-1.5 rounded-md border border-blue-500/40 text-blue-200 text-xs">Investiguer</button>
                <button type="button" onClick={() => setTimelineUser(a.user)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-default text-xs text-muted"><GitBranch className="w-3.5 h-3.5" />Voir timeline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeAuditSection === 'access-history' && (
        <div className="bg-card border border-default rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-app/60"><tr><th className="px-4 py-3 text-left">Utilisateur</th><th className="px-4 py-3 text-left">Date / heure</th><th className="px-4 py-3 text-left">IP</th><th className="px-4 py-3 text-left">Localisation</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Rôle</th><th className="px-4 py-3 text-left">Département</th><th className="px-4 py-3 text-left">Sécurité</th></tr></thead>
            <tbody className="divide-y divide-default">
              {accessRows.map((r) => {
                const brute = r.user === 'sophie.leroy@mykyntus.com' && (r.type === 'LOGIN_FAILED' || r.type === 'SUSPICIOUS');
                return <tr key={r.id}><td className="px-4 py-3 text-primary">{r.user}</td><td className="px-4 py-3 text-muted">{r.datetime}</td><td className="px-4 py-3 text-muted">{r.ip}</td><td className="px-4 py-3 text-muted">{r.location}</td><td className="px-4 py-3">{r.success ? <span className="text-emerald-300 text-xs">Succès</span> : <span className="text-rose-300 text-xs">Échec</span>}</td><td className="px-4 py-3 text-primary">{r.type.includes('LOGOUT') ? 'Logout' : 'Login'}</td><td className="px-4 py-3 text-primary">{r.role}</td><td className="px-4 py-3 text-primary">{r.departement}</td><td className="px-4 py-3">{brute && <span className="px-2 py-0.5 rounded border border-amber-500/50 text-[10px] text-amber-200 mr-2">Brute force</span>}{r.type === 'SUSPICIOUS' && <span className="px-2 py-0.5 rounded border border-rose-500/50 text-[10px] text-rose-200">Tentative suspecte</span>}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/55">
          <div className={`w-full max-w-md h-full bg-card border-l border-default p-5 space-y-4 transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-primary">Détail</h4>
              <button type="button" onClick={() => { setDrawerOpen(false); setTimeout(() => setSelected(null), 220); }} className="p-1.5 rounded-md hover:bg-app"><X className="w-4 h-4 text-muted" /></button>
            </div>
            <div className="text-sm space-y-3">
              <div><span className="text-muted">Département</span><p className="text-primary">{selected.departement}</p></div>
              <div><span className="text-muted">Pôle</span><p className="text-primary">{selected.pole}</p></div>
              <div><span className="text-muted">Cellule</span><p className="text-primary">{selected.cellule}</p></div>
              <div><span className="text-muted">Rôle</span><p className="text-primary">{selected.roleMetier}</p></div>
              <div><span className="text-muted">Élément</span><p className="text-primary">{selected.item}</p></div>
              <div><span className="text-muted">Modifié par</span><p className="text-primary">{selected.employee}</p></div>
              <div><span className="text-muted">Date</span><p className="text-primary">{selected.date}</p></div>
              <div><span className="text-muted">Statut</span><p className="text-primary">{selected.status}</p></div>
              <div><span className="text-muted">IP / Device</span><p className="text-primary">{selected.ip} · {selected.device}</p></div>
              <div><span className="text-muted">Avant / Après</span><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1"><pre className="p-2 rounded bg-app text-[11px] text-muted overflow-x-auto">{JSON.stringify(selected.beforeState, null, 2)}</pre><pre className="p-2 rounded bg-app text-[11px] text-emerald-200 overflow-x-auto">{JSON.stringify(selected.afterState, null, 2)}</pre></div></div>
              <div><span className="text-muted">Metadata</span><pre className="mt-1 p-2 rounded bg-app text-[11px] text-muted overflow-x-auto">{JSON.stringify(selected.metadata, null, 2)}</pre></div>
              <button type="button" onClick={() => { setSearch(selected.employee); setSelected(null); }} className="w-full py-2 rounded-lg border border-blue-500/40 bg-blue-600/15 text-blue-200 text-sm">Voir toutes les actions de cet utilisateur</button>
            </div>
          </div>
        </div>
      )}
      {timelineUser && (
        <div className="fixed inset-0 z-40 bg-navy-950/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-default rounded-xl p-4">
            <div className="flex items-center justify-between"><h4 className="text-primary font-semibold inline-flex items-center gap-2"><Shield className="w-4 h-4" />Timeline utilisateur</h4><button type="button" onClick={() => setTimelineUser(null)} className="text-muted hover:text-primary"><X className="w-4 h-4" /></button></div>
            <div className="mt-3 space-y-2 max-h-[50vh] overflow-auto">{rows.filter((r) => r.employee === timelineUser).map((r) => <div key={r.id} className="text-sm border border-default rounded p-2"><p className="text-primary">{r.date} · {r.action}</p><p className="text-muted">{r.item}</p></div>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
