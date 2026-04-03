import React, { useState } from 'react';
import { useReferrals } from '../../hooks/useReferrals';
import { ReferralTable } from '../../components/ReferralTable';
import { ReferralDetailsModal } from '../../components/ReferralDetailsModal';
import { AccessDenied } from '../../components/AccessDenied';
import { ReferralService } from '../../services/ReferralService';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import type { Referral } from '../../models/Referral';

export const AdminReferralManagement: React.FC = () => {
  const { referrals, loading, refresh } = useReferrals();
  const { user } = useAuth();

  if (user?.role === 'MANAGER' || user?.role === 'COACH') {
    return <AccessDenied backTo={{ to: '/parrainage/pm/dashboard', label: 'Retour au tableau de bord équipe' }} />;
  }
  const [detailId, setDetailId] = useState<string | null>(null);

  const selectedReferral = detailId
    ? (referrals.find((r) => r.id === detailId) ?? null)
    : null;

  const handleApprove = (r: Referral) => {
    ReferralService.updateStatus(r.id, 'APPROVED', {
      id: user?.id ?? 'admin-1',
      label: user?.name ?? 'Administrateur',
    });
    refresh();
  };

  const handleReject = (r: Referral) => {
    ReferralService.updateStatus(r.id, 'REJECTED', {
      id: user?.id ?? 'admin-1',
      label: user?.name ?? 'Administrateur',
    });
    refresh();
  };

  return (
    <section className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Gestion des parrainages</h1>
        <p className="text-sm text-slate-500 mt-1">
          Valider, rejeter ou consulter les dossiers.
        </p>
      </div>

      <ReferralTable
        referrals={referrals}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewDetails={(r) => setDetailId(r.id)}
        showActions
        scope="admin"
        detailMode="modal"
      />

      <ReferralDetailsModal
        referral={selectedReferral}
        open={!!detailId}
        onClose={() => setDetailId(null)}
        showCommentField={false}
      />
    </section>
  );
};
