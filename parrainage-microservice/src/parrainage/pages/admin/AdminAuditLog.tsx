import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Database } from 'lucide-react';
import { ReferralService } from '../../services/ReferralService';
import { AdminService } from '../../services/AdminService';
import { AccessDenied } from '../../components/AccessDenied';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { useAuditInterface } from '../../../../frontend/app/contexts/AuditInterfaceContext';
import { enrichAuditRowFromId, getAuditOrgTree } from '../../lib/auditOrgUi';
import type { JournalRow, SortKey, SeverityLevel } from '../../audit/auditTypes';
import { AuditTable } from '../../audit/AuditTable';
import { AuditDetailsDrawer } from '../../audit/AuditDetailsDrawer';
import { UserTimelineModal } from '../../audit/UserTimelineModal';
import { AccessHistoryTable } from '../../audit/AccessHistoryTable';
import { AnomaliesPanel } from '../../audit/AnomaliesPanel';
import { ReportingDashboard } from '../../audit/ReportingDashboard';
import type { AnomalyRow } from '../../audit/auditDemoData';

const ORG = getAuditOrgTree();
const ROLE_FILTER_OPTIONS = ['Tous', 'RP', 'Manager', 'Coach', 'Pilote'] as const;
const SEVERITY_OPTIONS = ['Tous', 'INFO', 'WARNING', 'CRITICAL'] as const;
const ACTION_CHIPS = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'CONFIG'] as const;

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

function deriveSeverity(action: string, status: string): SeverityLevel {
  if (action.includes('Suppression') || status === 'Rejeté') return 'CRITICAL';
  if (action.includes('Modification') || action === 'Validation') return 'WARNING';
  return 'INFO';
}

function deriveActionCode(action: string, rawAudit: boolean): string {
  if (rawAudit) return 'CONFIG';
  if (action === 'Création') return 'CREATE';
  if (action === 'Suppression') return 'DELETE';
  if (action === 'Validation') return 'APPROVE';
  return 'UPDATE';
}

function enrichJournal(
  base: Omit<JournalRow, 'ip' | 'device' | 'severity' | 'actionCode' | 'beforeState' | 'afterState' | 'metadata'>,
  id: string,
  rawAudit: boolean,
): JournalRow {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const ips = [`105.66.${hash % 200}.${10 + (hash % 40)}`, `10.0.${hash % 5}.${hash % 200}`];
  const devices = ['Chrome 124 / Win 11', 'Safari 17 / macOS', 'Edge / Win 10', 'Firefox / Linux'];
  const beforeState = rawAudit
    ? { configVersion: 'précédente', scope: 'referralProgramRules' }
    : { dossier: base.item, statut: 'avant_action' };
  const afterState = {
    statut: base.status,
    actionLibelle: base.action,
    reference: id,
  };
  return {
    ...base,
    ip: ips[hash % 2],
    device: devices[hash % devices.length],
    severity: deriveSeverity(base.action, base.status),
    actionCode: deriveActionCode(base.action, rawAudit),
    beforeState,
    afterState,
    metadata: {
      id,
      source: 'parrainage-microservice',
      channel: 'web',
      recordedAt: base.datetime,
      rawAudit,
    },
  };
}

const SECTION_INTRO: Record<string, { title: string; desc: string }> = {
  dashboard: {
    title: 'Audit Parrainage',
    desc: 'Vue synthétique — volumes et alertes.',
  },
  journal: {
    title: 'Journal d’audit',
    desc: 'Log technique complet : investigation, conformité, export. IP, device, gravité, actions.',
  },
  'access-history': {
    title: 'Historique d’accès',
    desc: 'Sécurité : connexions, déconnexions, échecs — sans actions métier.',
  },
  anomalies: {
    title: 'Anomalies',
    desc: 'Comportements suspects : volumes, horaires, accès inhabituels.',
  },
  reporting: {
    title: 'Reporting',
    desc: 'Indicateurs et tendances — pas un journal brut.',
  },
};

export const AdminAuditLog: React.FC = () => {
  const { user } = useAuth();
  const { section, setSection } = useAuditInterface();
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('Tous');
  const [actionFilter, setActionFilter] = useState('Tous');
  const [severityFilter, setSeverityFilter] = useState<(typeof SEVERITY_OPTIONS)[number]>('Tous');
  const [actionChip, setActionChip] = useState<string | 'Tous'>('Tous');
  const [deptFilter, setDeptFilter] = useState('Tous');
  const [poleFilter, setPoleFilter] = useState('Tous');
  const [celluleFilter, setCelluleFilter] = useState('Tous');
  const [roleMetierFilter, setRoleMetierFilter] = useState('Tous');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('datetime');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<JournalRow | null>(null);
  const [timelineUser, setTimelineUser] = useState<string | null>(null);

  useEffect(() => {
    const history = ReferralService.getHistory();
    const audit = AdminService.getAuditLog();
    // #region agent log
    fetch('http://127.0.0.1:7689/ingest/ee4e3cfe-fb44-4c74-8cbb-7e15078b1c94',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7899f1'},body:JSON.stringify({sessionId:'7899f1',runId:'pre-fix',hypothesisId:'H3',location:'AdminAuditLog.tsx:131',message:'raw datasets loaded',data:{historyCount:history?.length,auditCount:audit?.length,historyHasMissingId:Array.isArray(history)?history.some((h)=>!h?.id):null,auditHasMissingId:Array.isArray(audit)?audit.some((a)=>!a?.id):null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const fromHistory: JournalRow[] = history.map((h) => {
      // #region agent log
      fetch('http://127.0.0.1:7689/ingest/ee4e3cfe-fb44-4c74-8cbb-7e15078b1c94',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7899f1'},body:JSON.stringify({sessionId:'7899f1',runId:'pre-fix',hypothesisId:'H4',location:'AdminAuditLog.tsx:135',message:'mapping history item',data:{id:h?.id,idType:typeof h?.id,performedByLabel:h?.performedByLabel,action:h?.action},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const org = enrichAuditRowFromId(h.id);
      const base = {
        id: h.id,
        datetime: h.createdAt.toLocaleString('fr-FR'),
        employee: h.performedByLabel,
        action:
          h.action === 'SUBMITTED'
            ? 'Création'
            : h.action === 'APPROVED'
              ? 'Validation'
              : h.action === 'REJECTED'
                ? 'Suppression'
                : 'Modification',
        item: h.candidateName,
        status: h.action === 'APPROVED' || h.action === 'REWARDED' ? 'Validé' : 'En attente',
        ...org,
      };
      return enrichJournal(base, h.id, false);
    });

    const fromAudit: JournalRow[] = audit.map((a) => {
      // #region agent log
      fetch('http://127.0.0.1:7689/ingest/ee4e3cfe-fb44-4c74-8cbb-7e15078b1c94',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7899f1'},body:JSON.stringify({sessionId:'7899f1',runId:'pre-fix',hypothesisId:'H5',location:'AdminAuditLog.tsx:157',message:'mapping audit item',data:{id:a?.id,idType:typeof a?.id,userLabel:a?.userLabel,action:a?.action},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const org = enrichAuditRowFromId(a.id);
      const base = {
        id: a.id,
        datetime: a.timestamp.toLocaleString('fr-FR'),
        employee: a.userLabel,
        action: a.action === 'CONFIG_UPDATE' ? 'Modification' : 'Validation',
        item: a.details ?? 'Configuration système',
        status: 'Validé',
        ...org,
      };
      return enrichJournal(base, a.id, true);
    });

    setRows([...fromHistory, ...fromAudit]);
  }, []);

  useEffect(() => {
    setPoleFilter('Tous');
    setCelluleFilter('Tous');
  }, [deptFilter]);

  useEffect(() => {
    setCelluleFilter('Tous');
  }, [poleFilter]);

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

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const data = rows.filter((r) => {
      const qOk =
        !q ||
        `${r.datetime} ${r.employee} ${r.action} ${r.item} ${r.departement} ${r.pole} ${r.cellule} ${r.roleMetier} ${r.ip} ${r.device}`
          .toLowerCase()
          .includes(q);
      const dOk = !dateFilter || r.datetime.startsWith(dateFilter);
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
      const va = String(a[sortKey as keyof JournalRow]).toLowerCase();
      const vb = String(b[sortKey as keyof JournalRow]).toLowerCase();
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
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fallbackRows: JournalRow[] = [
    enrichJournal(
      {
        id: 'mock-1',
        datetime: '2026-03-27 08:10',
        employee: 'Audit Bot',
        action: 'Création',
        item: 'Parrainage Martin / Leila',
        status: 'En attente',
        ...enrichAuditRowFromId('mock-1'),
      },
      'mock-1',
      false,
    ),
    enrichJournal(
      {
        id: 'mock-2',
        datetime: '2026-03-27 09:55',
        employee: 'RH Parrainage',
        action: 'Validation',
        item: 'Prime parrainage T2',
        status: 'Validé',
        ...enrichAuditRowFromId('mock-2'),
      },
      'mock-2',
      false,
    ),
    enrichJournal(
      {
        id: 'mock-3',
        datetime: '2026-03-27 10:33',
        employee: 'Comptable',
        action: 'Suppression',
        item: 'Dossier doublon #P-44',
        status: 'Rejeté',
        ...enrichAuditRowFromId('mock-3'),
      },
      'mock-3',
      false,
    ),
  ];
  const visibleRows = pagedRows.length > 0 ? pagedRows : fallbackRows;
  const hasNoData = rows.length === 0;
  const isMockDisplay = pagedRows.length === 0;

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir('asc');
    }
  };

  const exportAuditCsv = () => {
    const csv = toCsv(
      [
        'Date/heure',
        'Utilisateur',
        'IP',
        'Device',
        'Gravité',
        'Code',
        'Département',
        'Pôle',
        'Cellule',
        'Rôle',
        'Action',
        'Élément',
        'Statut',
      ],
      filteredRows.map((r) => [
        r.datetime,
        r.employee,
        r.ip,
        r.device,
        r.severity,
        r.actionCode,
        r.departement,
        r.pole,
        r.cellule,
        r.roleMetier,
        r.action,
        r.item,
        r.status,
      ]),
    );
    download('audit_parrainage.csv', csv, 'text/csv;charset=utf-8');
  };

  const exportAuditExcel = () => {
    const tsv = toCsv(
      [
        'Date/heure',
        'Utilisateur',
        'IP',
        'Device',
        'Gravité',
        'Code',
        'Département',
        'Pôle',
        'Cellule',
        'Rôle',
        'Action',
        'Élément',
        'Statut',
      ],
      filteredRows.map((r) => [
        r.datetime,
        r.employee,
        r.ip,
        r.device,
        r.severity,
        r.actionCode,
        r.departement,
        r.pole,
        r.cellule,
        r.roleMetier,
        r.action,
        r.item,
        r.status,
      ]),
    );
    download('audit_parrainage.xls', tsv, 'application/vnd.ms-excel');
  };

  const selClass = 'bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200 min-w-[140px]';
  const intro = SECTION_INTRO[section] ?? SECTION_INTRO.journal;

  const investigateUser = () => {
    if (!selected) return;
    setSection('journal');
    setSearch(selected.employee);
    setPage(1);
    setSelected(null);
  };

  const openTimeline = () => {
    if (!selected) return;
    setTimelineUser(selected.employee);
  };

  const investigateAnomaly = (a: AnomalyRow) => {
    const q = a.relatedUserLabel ?? a.searchHints?.[0] ?? '';
    setSection('journal');
    setSearch(q);
    setPage(1);
  };

  const openAnomalyTimeline = (a: AnomalyRow) => {
    const u = a.relatedUserLabel;
    if (u) setTimelineUser(u);
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'AUDIT') {
    return (
      <AccessDenied
        message="Cette section est réservée aux administrateurs globaux et au rôle Audit."
        backTo={{ to: '/parrainage/pilote/dashboard', label: 'Retour' }}
      />
    );
  }

  return (
    <section className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">{intro.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{intro.desc}</p>
      </div>

      {section === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-navy p-4 bg-gradient-to-br from-blue-950/40 to-navy-900 border border-blue-900/40 shadow-sm hover:shadow-[0_10px_25px_rgba(37,99,235,0.18)] hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-4 h-4 text-blue-300" />
              <p className="text-xs">Nombre total</p>
            </div>
            <p className="text-2xl text-white font-bold mt-2">{rows.length}</p>
            <p className="text-xs text-slate-500">événements journal</p>
          </div>
          <div className="card-navy p-4 bg-gradient-to-br from-emerald-950/35 to-navy-900 border border-emerald-900/40 shadow-sm hover:shadow-[0_10px_25px_rgba(16,185,129,0.16)] hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <p className="text-xs">Infos (gravité)</p>
            </div>
            <p className="text-2xl text-white font-bold mt-2">{rows.filter((r) => r.severity === 'INFO').length}</p>
            <p className="text-xs text-slate-500">niveau INFO</p>
          </div>
          <div className="card-navy p-4 bg-gradient-to-br from-amber-950/35 to-navy-900 border border-amber-900/40 shadow-sm hover:shadow-[0_10px_25px_rgba(245,158,11,0.16)] hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock3 className="w-4 h-4 text-amber-300" />
              <p className="text-xs">Avertissements</p>
            </div>
            <p className="text-2xl text-white font-bold mt-2">{rows.filter((r) => r.severity === 'WARNING').length}</p>
            <p className="text-xs text-slate-500">WARNING</p>
          </div>
          <div className="card-navy p-4 bg-gradient-to-br from-rose-950/35 to-navy-900 border border-rose-900/40 shadow-sm hover:shadow-[0_10px_25px_rgba(244,63,94,0.16)] hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-300">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <p className="text-xs">Critiques</p>
            </div>
            <p className="text-2xl text-white font-bold mt-2">{rows.filter((r) => r.severity === 'CRITICAL').length}</p>
            <p className="text-xs text-slate-500">CRITICAL</p>
          </div>
        </div>
      )}

      {section === 'access-history' && <AccessHistoryTable />}

      {section === 'reporting' && <ReportingDashboard />}

      {section === 'anomalies' && (
        <AnomaliesPanel onInvestigate={investigateAnomaly} onOpenTimeline={openAnomalyTimeline} />
      )}

      {section === 'journal' && (
        <>
          <div className="card-navy p-4 space-y-3 border border-navy-800/80">
            <div className="flex flex-wrap items-end gap-3">
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPage(1);
                }}
                className={selClass}
                aria-label="Département"
              >
                {deptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d === 'Tous' ? 'Département' : d}
                  </option>
                ))}
              </select>
              <select
                value={poleFilter}
                onChange={(e) => {
                  setPoleFilter(e.target.value);
                  setPage(1);
                }}
                className={selClass}
                disabled={deptFilter === 'Tous'}
                aria-label="Pôle"
              >
                {poleOptions.map((p) => (
                  <option key={p} value={p}>
                    {p === 'Tous' ? 'Pôle' : p}
                  </option>
                ))}
              </select>
              <select
                value={celluleFilter}
                onChange={(e) => {
                  setCelluleFilter(e.target.value);
                  setPage(1);
                }}
                className={selClass}
                disabled={deptFilter === 'Tous' || poleFilter === 'Tous'}
                aria-label="Cellule"
              >
                {celluleOptions.map((c) => (
                  <option key={c} value={c}>
                    {c === 'Tous' ? 'Cellule' : c}
                  </option>
                ))}
              </select>
              <select
                value={roleMetierFilter}
                onChange={(e) => {
                  setRoleMetierFilter(e.target.value);
                  setPage(1);
                }}
                className={selClass}
                aria-label="Rôle métier"
              >
                {ROLE_FILTER_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === 'Tous' ? 'Rôle' : r}
                  </option>
                ))}
              </select>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value as (typeof SEVERITY_OPTIONS)[number]);
                  setPage(1);
                }}
                className={selClass}
                aria-label="Gravité"
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'Tous' ? 'Gravité' : s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={resetHierarchyFilters}
                className="px-3 py-2 rounded-lg border border-navy-700 text-sm text-slate-400 hover:bg-navy-800 hover:text-slate-200 whitespace-nowrap transition-colors"
              >
                Réinitialiser filtres
              </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[11px] text-slate-500 uppercase">Action rapide :</span>
              {['Tous', ...ACTION_CHIPS].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setActionChip(c);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors duration-150 ${
                    actionChip === c
                      ? 'bg-blue-600/25 border-blue-500/50 text-blue-200'
                      : 'border-navy-700 text-slate-400 hover:border-navy-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Recherche globale (utilisateur, IP, action, org…)"
                className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200 min-w-[200px] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
              <select
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value);
                  setPage(1);
                }}
                className={selClass}
              >
                {users.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className={selClass}
              >
                {actions.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={exportAuditExcel}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm whitespace-nowrap transition-colors"
                >
                  Excel
                </button>
                <button
                  type="button"
                  onClick={exportAuditCsv}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm whitespace-nowrap transition-colors"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>

          <AuditTable
            visibleRows={visibleRows}
            hasNoData={hasNoData}
            isMockDisplay={isMockDisplay}
            sortKey={sortKey}
            sortDir={sortDir}
            onToggleSort={toggleSort}
            onView={setSelected}
          />

          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {safePage} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md border border-navy-700 disabled:opacity-40 hover:bg-navy-800 transition-colors"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-md border border-navy-700 disabled:opacity-40 hover:bg-navy-800 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}

      <AuditDetailsDrawer
        selected={selected}
        onClose={() => setSelected(null)}
        onInvestigateUser={investigateUser}
        onOpenUserTimeline={openTimeline}
      />

      <UserTimelineModal
        userLabel={timelineUser ?? ''}
        rows={rows}
        open={!!timelineUser}
        onClose={() => setTimelineUser(null)}
      />
    </section>
  );
};
