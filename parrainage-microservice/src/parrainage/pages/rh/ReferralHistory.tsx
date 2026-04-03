import React, { useEffect, useMemo, useState } from 'react';
import { ReferralService } from '../../services/ReferralService';
import type { ReferralHistoryEntry } from '../../models/Referral';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

const actionLabel = (action: ReferralHistoryEntry['action']) => {
  switch (action) {
    case 'APPROVED':
      return 'Validé';
    case 'REJECTED':
      return 'Rejeté';
    case 'REWARDED':
      return 'Prime versée';
    case 'SUBMITTED':
      return 'Soumis';
    default:
      return action;
  }
};

export const ReferralHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ReferralHistoryEntry[]>([]);
  const { user } = useAuth();
  const unauthorized = user?.role !== 'RH';

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      const all = ReferralService.getHistory();
      setHistory(all);
      setLoading(false);
    }, 180);
    return () => window.clearTimeout(t);
  }, []);

  const rows = useMemo(() => {
    // Table requirement focuses on Approved/Rejected/Rewarded.
    return history.filter((h) => h.action !== 'SUBMITTED');
  }, [history]);

  return (
      <section className="flex-1 min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Historique des parrainages</h1>
          <p className="text-sm text-slate-500 mt-1">Historique des actions enregistrées par le processus RH.</p>
        </div>

        {unauthorized ? (
          <div className="card-navy p-10 text-center text-red-200 text-sm">
            Accès refusé. Réservé à la RH.
          </div>
        ) : null}

        {!unauthorized && loading ? (
          <div className="card-navy p-10 text-center text-slate-500 text-sm">Chargement…</div>
        ) : !unauthorized && rows.length === 0 ? (
          <div className="card-navy p-10 text-center text-slate-400 text-sm">Aucun événement.</div>
        ) : (
          !unauthorized ? (
            <div className="card-navy overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-navy-950/50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Candidat</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Réalisé par</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-navy-800/30">
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{r.candidateName}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{actionLabel(r.action)}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.performedByLabel}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {r.createdAt.toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          ) : null
        )}
      </section>
  );
};

