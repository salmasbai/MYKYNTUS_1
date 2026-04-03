import React, { useMemo, useState } from 'react';
import { Search, Shield } from 'lucide-react';
import { ACCESS_LOG_DEMO } from './auditDemoData';
import { enrichAccessWithBruteForce, accessTypeLabel } from './auditAccessUtils';
import { SeverityBadge } from './AuditBadges';

export const AccessHistoryTable: React.FC = () => {
  const [q, setQ] = useState('');
  const rows = useMemo(() => enrichAccessWithBruteForce(ACCESS_LOG_DEMO), []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        !qq ||
        `${r.user} ${r.ip} ${r.location} ${r.label} ${r.detail ?? ''}`.toLowerCase().includes(qq),
    );
  }, [rows, q]);

  const hasBrute = filtered.some((r) => r.bruteForce);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-xs text-slate-300">
        <span className="font-semibold text-emerald-300/90">Sécurité — </span>
        Uniquement connexions réussies ou échouées et déconnexions. Aucune action métier (création dossier, suppression, etc.).
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher utilisateur, IP, lieu…"
            className="w-full bg-navy-900 border border-navy-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 transition-colors focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
        {hasBrute && (
          <span className="text-xs text-amber-300 flex items-center gap-1.5">
            <Shield className="w-4 h-4 shrink-0" />
            Détection brute force (≥5 échecs / 2 min)
          </span>
        )}
      </div>
      <div className="card-navy overflow-x-auto border border-navy-800/80">
        <table className="w-full text-sm min-w-[920px]">
          <thead className="bg-navy-800/55 text-slate-400 text-left">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Date / heure</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Sécurité</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-navy-800/35 transition-colors">
                <td className="px-4 py-3 text-slate-200 font-medium">{r.user}</td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{r.datetime}</td>
                <td className="px-4 py-3 text-slate-300 font-mono text-xs">{r.ip}</td>
                <td className="px-4 py-3 text-slate-400">{r.location}</td>
                <td className="px-4 py-3">
                  {r.success ? (
                    <span className="text-emerald-400 text-xs font-medium">Succès</span>
                  ) : (
                    <span className="text-rose-400 text-xs font-medium">Échec</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.bruteForce ? (
                    <SeverityBadge level="WARNING" />
                  ) : (
                    <span className="text-[10px] text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">{accessTypeLabel(r)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-[240px]">{r.detail ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
