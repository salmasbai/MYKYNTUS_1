import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { ReferralService } from '../../services/ReferralService';
import type { Referral, ReferralStatus } from '../../models/Referral';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { useNavigation } from '../../../../frontend/app/providers/NavigationProvider';

const StatusBadge: React.FC<{ status: ReferralStatus }> = ({ status }) => {
  const styles: Record<ReferralStatus, string> = {
    SUBMITTED: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    APPROVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    REJECTED: 'bg-red-500/15 text-red-300 border-red-500/40',
    REWARDED: 'bg-purple-500/15 text-purple-200 border-purple-500/40',
  };

  const labels: Record<ReferralStatus, string> = {
    SUBMITTED: 'En attente',
    APPROVED: 'Validé',
    REJECTED: 'Rejeté',
    REWARDED: 'Prime versée',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export const ReferralManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Referral[]>([]);
  const { user } = useAuth();
  const { openReferralDetails } = useNavigation();
  const unauthorized = user?.role !== 'RH';

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      setRows(ReferralService.getAllReferrals().slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setLoading(false);
    }, 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="flex-1 min-w-0">
        <div className="space-y-6">
          {unauthorized ? (
            <div className="card-navy p-10 text-center text-red-200 text-sm">
              Accès refusé. Réservé à la RH.
            </div>
          ) : null}
          <div>
            <h1 className="text-2xl font-semibold text-slate-50">Gestion des parrainages</h1>
            <p className="text-sm text-slate-500 mt-1">Liste consultative — la validation s’effectue depuis le détail.</p>
          </div>

          {loading ? (
            <div className="card-navy p-10 text-center text-slate-500 text-sm">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="card-navy p-10 text-center text-slate-400 text-sm">Aucun dossier.</div>
          ) : (
            <div className="card-navy overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-navy-950/50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Candidat</th>
                      <th className="px-4 py-3">Poste</th>
                      <th className="px-4 py-3">Parrain</th>
                      <th className="px-4 py-3">Projet</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-navy-800/30">
                        <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{r.candidateName}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.position}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.referrerName}</td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.projectName}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {r.createdAt.toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openReferralDetails(r.id)}
                            className="text-xs text-soft-blue hover:underline font-medium"
                          >
                            Voir le détail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
  );
};

