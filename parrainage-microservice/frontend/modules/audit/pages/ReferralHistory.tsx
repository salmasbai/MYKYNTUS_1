import React from 'react';
import { Timeline } from '../../../../parrainage-service/src/components/Timeline';
import { MOCK_REFERRALS } from '../../../../parrainage-service/src/services/mockData';

export const ReferralHistory: React.FC<{ id?: string }> = ({ id }) => {
  const referral = MOCK_REFERRALS.find((r) => r.id === id);

  if (!referral) {
    return <p className="text-xs text-slate-500">Parrainage introuvable.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-50">
        Historique du parrainage {referral.id}
      </h2>
      <div className="card-navy p-4 md:p-5">
        <Timeline items={referral.timeline} />
      </div>
    </div>
  );
};

