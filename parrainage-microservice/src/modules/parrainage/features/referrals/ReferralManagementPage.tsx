import React, { useState } from 'react';
import { useAuth } from '../../../../../frontend/app/hooks/useAuth';
import { useScopedReferrals } from '../../core/hooks/useScopedReferrals';
import { ReferralService } from '../../core/services/ReferralService';
import { ReferralTable } from '../../../../parrainage/components/ReferralTable';
import { ReferralDetailsModal } from '../../../../parrainage/components/ReferralDetailsModal';
import { AccessDenied } from '../../shared/components/AccessDenied';
import type { Referral } from '../../core/models/Referral';

export type ReferralManagementMode = 'admin' | 'rh' | 'pm';

interface ReferralManagementPageProps {
  mode: ReferralManagementMode;
  title?: string;
  subtitle?: string;
}

export const ReferralManagementPage: React.FC<ReferralManagementPageProps> = ({
  mode,
  title,
  subtitle,
}) => {
  const { user } = useAuth();
  const { referrals, loading, refresh } = useScopedReferrals(user);
  const [detailId, setDetailId] = useState<string | null>(null);

  if (mode === 'pm' && user?.role !== 'MANAGER' && user?.role !== 'COACH' && user?.role !== 'RP') {
    return <AccessDenied backTo={{ to: '/parrainage/pm/dashboard', label: 'Retour' }} />;
  }
  if ((mode === 'admin' || mode === 'rh') && user?.role !== 'ADMIN' && user?.role !== 'RH') {
    return <AccessDenied backTo={{ to: '/parrainage/pilote/dashboard', label: 'Retour' }} />;
  }

  const selectedReferral = detailId ? referrals.find((r) => r.id === detailId) ?? null : null;

  const handleApprove = (r: Referral) => {
    if (mode === 'pm') return;
    ReferralService.updateStatus(r.id, 'APPROVED', { id: user?.id ?? 'admin-1', label: user?.name ?? 'Administrateur' });
    refresh();
  };

  const handleReject = (r: Referral) => {
    if (mode === 'pm') return;
    ReferralService.updateStatus(r.id, 'REJECTED', { id: user?.id ?? 'admin-1', label: user?.name ?? 'Administrateur' });
    refresh();
  };

  const scope = mode === 'pm' ? 'pm' : 'admin';
  const showApproveReject = mode !== 'pm';

  const defaultTitle =
    mode === 'admin' ? 'Gestion des parrainages' : mode === 'rh' ? 'Gestion des parrainages' : 'Suivi des parrainages';
  const defaultSubtitle =
    mode === 'pm' ? 'Parrainages liés à votre équipe (lecture seule).' : 'Approuver, rejeter ou consulter les dossiers.';

  return (
    <section className="flex-1 space-y-6">
      {mode === 'pm' ? (
        <p className="text-sm text-slate-500 max-w-3xl">{subtitle ?? defaultSubtitle}</p>
      ) : (
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">{title ?? defaultTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle ?? defaultSubtitle}</p>
        </div>
      )}

      <ReferralTable
        referrals={referrals}
        loading={loading}
        onApprove={showApproveReject ? handleApprove : undefined}
        onReject={showApproveReject ? handleReject : undefined}
        onViewDetails={(r) => setDetailId(r.id)}
        showActions
        scope={scope}
        detailMode="modal"
      />

      <ReferralDetailsModal
        referral={selectedReferral}
        open={!!detailId}
        onClose={() => setDetailId(null)}
        showCommentField={mode === 'pm'}
      />
    </section>
  );
};
