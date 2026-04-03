import React, { useMemo } from 'react';
import { Euro } from 'lucide-react';
import { ReferralService } from '../../services/ReferralService';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

export const PiloteBonus: React.FC = () => {
  const { user } = useAuth();
  const referrerId = user?.id ?? '';
  const allReferrals = ReferralService.getAllReferrals();
  const myReferrals = allReferrals.filter((r) => r.referrerId === referrerId);

  const summary = useMemo(() => {
    const rewarded = myReferrals.filter((r) => r.status === 'REWARDED');
    const approved = myReferrals.filter((r) => r.status === 'APPROVED');
    const totalEarned = rewarded.reduce((s, r) => s + r.rewardAmount, 0);
    const pendingAmount = approved.reduce((s, r) => s + (r.rewardAmount || 0), 0);
    const paidAmount = totalEarned;
    return {
      totalEarned,
      pendingAmount,
      paidAmount,
      nextPaymentDate: rewarded.length > 0 ? 'Prochain versement selon planning' : undefined,
    };
  }, [myReferrals]);

  const totalSteps = 5;
  const completedSteps =
    myReferrals.filter((r) => r.status === 'REWARDED').length > 0 ? 5 : 2;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card-navy p-4 md:p-5 space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">
              Vue globale de vos primes
            </h2>
            <p className="text-xs text-slate-500">
              Suivez la progression de vos primes de parrainage.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-soft-blue/10 px-3 py-1 text-[11px] text-soft-blue">
            <Euro className="h-3 w-3" />
            {summary.totalEarned} DH
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Progression jusqu'à la prochaine prime</span>
            <span className="text-slate-200">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-navy-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-soft-blue to-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {summary.nextPaymentDate && (
            <p className="text-[11px] text-slate-500">
              Prochaine date de versement estimée :{' '}
              <span className="text-slate-200">
                {summary.nextPaymentDate}
              </span>
            </p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3 text-xs text-slate-200">
          <div className="rounded-lg border border-navy-800 bg-navy-900/60 p-3">
            <p className="text-[11px] text-slate-500 mb-1">Total cumulé</p>
            <p className="text-lg font-semibold">{summary.totalEarned} DH</p>
          </div>
          <div className="rounded-lg border border-navy-800 bg-navy-900/60 p-3">
            <p className="text-[11px] text-slate-500 mb-1">En attente</p>
            <p className="text-lg font-semibold text-yellow-400">
              {summary.pendingAmount} DH
            </p>
          </div>
          <div className="rounded-lg border border-navy-800 bg-navy-900/60 p-3">
            <p className="text-[11px] text-slate-500 mb-1">Versé</p>
            <p className="text-lg font-semibold text-emerald-400">
              {summary.paidAmount} DH
            </p>
          </div>
        </div>
      </div>

      <div className="card-navy p-4 md:p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-50">
          Historique de vos parrainages
        </h3>
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {myReferrals.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-navy-800 bg-navy-900/60 px-3 py-2 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-slate-100">{r.candidateName}</p>
                <span className="text-[11px] text-slate-500">
                  {r.createdAt.toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-1">{r.position}</p>
              <p className="text-[11px] text-slate-400">
                Prime potentielle :{' '}
                <span className="text-slate-200">
                  {r.status === 'REWARDED'
                    ? r.rewardAmount
                    : ReferralService.getTotalReferralBonusPotentialDH(r.id)}{' '}
                  DH
                </span>
                {r.status !== 'REWARDED' && (
                  <span className="text-slate-500">
                    {' '}
                    (déjà acquis : {ReferralService.getAccruedReferralBonusDH(r.id)} DH)
                  </span>
                )}
              </p>
            </div>
          ))}
          {myReferrals.length === 0 && (
            <p className="text-xs text-slate-500">
              Vous n'avez pas encore de parrainages associés.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
