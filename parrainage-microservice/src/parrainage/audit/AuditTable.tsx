import React from 'react';
import { Eye, Inbox } from 'lucide-react';
import type { JournalRow, SortKey } from './auditTypes';
import { SeverityBadge, ActionNatureBadge } from './AuditBadges';

interface AuditTableProps {
  visibleRows: JournalRow[];
  hasNoData: boolean;
  isMockDisplay: boolean;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onToggleSort: (k: SortKey) => void;
  onView: (row: JournalRow) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  visibleRows,
  hasNoData,
  isMockDisplay,
  sortKey,
  sortDir,
  onToggleSort,
  onView,
}) => {
  return (
    <>
      {hasNoData && (
        <div className="card-navy p-4 flex items-center gap-3 border border-navy-700/70 bg-navy-900/45">
          <Inbox className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-slate-200 text-sm">Aucune donnée disponible</p>
            <p className="text-xs text-slate-500">Affichage de démonstration avec des lignes fictives.</p>
          </div>
        </div>
      )}

      <div className="card-navy overflow-x-auto border border-navy-800/80 transition-shadow hover:shadow-lg hover:shadow-navy-950/40">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-navy-800/55 text-slate-300 font-semibold">
            <tr>
              <th className="px-3 py-3 text-left cursor-pointer whitespace-nowrap" onClick={() => onToggleSort('datetime')}>
                Date / heure {sortKey === 'datetime' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="px-3 py-3 text-left cursor-pointer" onClick={() => onToggleSort('employee')}>
                Utilisateur
              </th>
              <th className="px-3 py-3 text-left">IP</th>
              <th className="px-3 py-3 text-left">Device</th>
              <th className="px-3 py-3 text-left cursor-pointer" onClick={() => onToggleSort('severity')}>
                Gravité
              </th>
              <th className="px-3 py-3 text-left cursor-pointer" onClick={() => onToggleSort('departement')}>
                Dépt.
              </th>
              <th className="px-3 py-3 text-left cursor-pointer" onClick={() => onToggleSort('pole')}>
                Pôle
              </th>
              <th className="px-3 py-3 text-left cursor-pointer" onClick={() => onToggleSort('cellule')}>
                Cellule
              </th>
              <th className="px-3 py-3 text-left cursor-pointer" onClick={() => onToggleSort('roleMetier')}>
                Rôle
              </th>
              <th className="px-3 py-3 text-left cursor-pointer" onClick={() => onToggleSort('action')}>
                Action
              </th>
              <th className="px-3 py-3 text-left cursor-pointer" onClick={() => onToggleSort('item')}>
                Élément
              </th>
              <th className="px-3 py-3 text-left">Voir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {visibleRows.map((r) => (
              <tr key={r.id} className="hover:bg-navy-800/40 transition-colors duration-150">
                <td className="px-3 py-3 text-slate-400 whitespace-nowrap text-xs">{r.datetime}</td>
                <td className="px-3 py-3 text-slate-200">{r.employee}</td>
                <td className="px-3 py-3 text-slate-400 font-mono text-xs" title="Adresse IP source">
                  {r.ip}
                </td>
                <td className="px-3 py-3 text-slate-500 text-xs max-w-[140px] truncate" title={r.device}>
                  {r.device}
                </td>
                <td className="px-3 py-3">
                  <span title={`Code: ${r.actionCode}`}>
                    <SeverityBadge level={r.severity} />
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-400 text-xs">{r.departement}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{r.pole}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{r.cellule}</td>
                <td className="px-3 py-3 text-slate-200 text-xs">{r.roleMetier}</td>
                <td className="px-3 py-3">
                  <ActionNatureBadge action={r.action} />
                </td>
                <td className="px-3 py-3 text-slate-300 max-w-[180px] truncate" title={r.item}>
                  {r.item}
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onView(r)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-blue-500/30 bg-blue-600/15 hover:bg-blue-500/30 text-blue-200 text-xs transition-all duration-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isMockDisplay && (
          <p className="px-4 py-2 text-[11px] text-slate-500 border-t border-navy-800">
            Mode démo actif (aucune ligne réelle sur ce filtre).
          </p>
        )}
      </div>
    </>
  );
};
