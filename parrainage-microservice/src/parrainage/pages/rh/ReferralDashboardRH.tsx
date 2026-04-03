import React, { useEffect, useMemo, useState } from 'react';
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

export const ReferralDashboardRH: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const { user } = useAuth();
  const { openReferralDetails } = useNavigation();
  const unauthorized = user?.role !== 'RH';

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      setReferrals(ReferralService.getAllReferrals());
      setLoading(false);
    }, 220);
    return () => window.clearTimeout(t);
  }, []);

  const kpis = useMemo(() => {
    const total = referrals.length;
    const approved = referrals.filter((r) => r.status === 'APPROVED' || r.status === 'REWARDED').length;
    const rejected = referrals.filter((r) => r.status === 'REJECTED').length;
    const rewards = referrals.filter((r) => r.status === 'REWARDED').reduce((s, r) => s + (r.rewardAmount || 0), 0);
    return { total, approved, rejected, rewards };
  }, [referrals]);

  const recent = useMemo(() => {
    return [...referrals].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
  }, [referrals]);

  return (
      <section className="flex-1">
        {unauthorized ? (
          <div className="card-navy p-10 text-center text-red-200 text-sm">
            Accès refusé. Réservé à la RH.
          </div>
        ) : null}
        {loading ? (
          <div className="card-navy p-10 text-center text-slate-500 text-sm">Chargement…</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-50">Pilotage parrainage (RH)</h1>
              <p className="text-sm text-slate-500 mt-1">Vue d’ensemble pour le pilotage et la décision.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="card-navy p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p className="text-2xl font-semibold text-slate-50 mt-2">{kpis.total}</p>
              </div>
              <div className="card-navy p-5 border-emerald-500/20">
                <p className="text-xs uppercase tracking-wide text-slate-500">Validés</p>
                <p className="text-2xl font-semibold text-emerald-300 mt-2">{kpis.approved}</p>
              </div>
              <div className="card-navy p-5 border-red-500/20">
                <p className="text-xs uppercase tracking-wide text-slate-500">Rejetés</p>
                <p className="text-2xl font-semibold text-red-300 mt-2">{kpis.rejected}</p>
              </div>
              <div className="card-navy p-5 border-purple-500/20">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total primes</p>
                <p className="text-2xl font-semibold text-purple-200 mt-2">{kpis.rewards} €</p>
              </div>
            </div>

            <div className="card-navy p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Derniers dossiers</h2>
              {recent.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune donnée.</p>
              ) : (
                <div className="space-y-3">
                  {recent.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-navy-800/70 bg-navy-900/40 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{r.candidateName}</p>
                        <p className="text-xs text-slate-500 truncate">{r.position} · {r.projectName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={r.status} />
                        <button type="button" onClick={() => openReferralDetails(r.id)} className="text-xs text-soft-blue hover:underline whitespace-nowrap">
                          Voir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
  );
};

