import React, { useState } from 'react';
import { useReferrals } from '../../hooks/useReferrals';
import { ReferralTable } from '../../components/ReferralTable';
import { ReferralDetailsModal } from '../../components/ReferralDetailsModal';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

export const PMReferrals: React.FC = () => {
  const { user } = useAuth();
  const projectId = user?.projectId ?? user?.departmentId ?? 'proj-1';
  const { referrals, loading } = useReferrals(projectId);
  const [detailId, setDetailId] = useState<string | null>(null);

  const selectedReferral = detailId ? referrals.find((r) => r.id === detailId) ?? null : null;

  return (
    <section className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Suivi des parrainages</h1>
        <p className="text-sm text-slate-500 mt-1">
          Parrainages liés à votre équipe (lecture seule).
        </p>
      </div>

      <ReferralTable
        referrals={referrals}
        loading={loading}
        showActions
        scope="pm"
        onViewDetails={(r) => setDetailId(r.id)}
        detailMode="modal"
      />

      <ReferralDetailsModal
        referral={selectedReferral}
        open={!!detailId}
        onClose={() => setDetailId(null)}
        showCommentField
      />
    </section>
  );
};
