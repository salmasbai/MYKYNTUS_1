import React, { useMemo } from 'react';
import { useReferrals } from '../../hooks/useReferrals';
import { buildTeamMembersFromReferrals } from '../../components/TeamTable';
import { MonthlyChart } from '../../components/MonthlyChart';

export const PMPerformance: React.FC = () => {
  const { referrals } = useReferrals();

  const topReferrers = useMemo(() => {
    const members = buildTeamMembersFromReferrals(referrals);
    return members
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 5);
  }, [referrals]);

  return (
    <section className="flex-1 space-y-6">
      <p className="text-sm text-slate-500 max-w-3xl">
        Meilleurs parraineurs et statistiques.
      </p>

      <MonthlyChart referrals={referrals} />

      <div className="card-navy p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">
          Top parraineurs
        </h3>
        {topReferrers.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune donnée.</p>
        ) : (
          <div className="space-y-3">
            {topReferrers.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-navy-800 bg-navy-900/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm w-6">#{i + 1}</span>
                  <span className="font-medium text-slate-200">{m.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400">{m.referralCount} parrainages</span>
                  <span
                    className={
                      m.referralCount > 0 && m.successCount / m.referralCount >= 0.5
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  >
                    {m.referralCount > 0
                      ? Math.round((m.successCount / m.referralCount) * 100)
                      : 0}
                    % succès
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
