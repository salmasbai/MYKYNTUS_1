import React from 'react';
import { useReferrals } from '../../hooks/useReferrals';
import { useReferralStats } from '../../hooks/useStats';
import { KPIStats } from '../../components/KPIStats';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

export const PMDashboard: React.FC = () => {
  const { user } = useAuth();
  const projectId = user?.projectId ?? user?.departmentId ?? 'proj-1';
  const { referrals } = useReferrals(projectId);
  const stats = useReferralStats(referrals);

  return (
    <section className="flex-1 space-y-6">
      <p className="text-sm text-slate-500 max-w-3xl">
        Vue d'ensemble des parrainages de votre équipe.
      </p>

      <KPIStats
        items={[
          { label: 'Parrainages équipe', value: stats.total },
          { label: 'Validés', value: stats.validated, accent: 'green' },
          { label: 'Taux de succès', value: `${stats.successRate}%`, accent: 'blue' },
        ]}
      />
    </section>
  );
};
