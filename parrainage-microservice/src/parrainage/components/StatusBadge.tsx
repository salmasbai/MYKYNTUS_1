import React from 'react';
import type { ReferralStatus } from '../models/Referral';

/** Matches Documentation Badge: px-2.5 py-0.5 rounded-full text-[11px] font-semibold border */
const STATUS_STYLES: Record<ReferralStatus, string> = {
  SUBMITTED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  REWARDED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const STATUS_LABELS: Record<ReferralStatus, string> = {
  SUBMITTED: 'En attente',
  APPROVED: 'Validé',
  REJECTED: 'Rejeté',
  REWARDED: 'Prime versée',
};

export const StatusBadge: React.FC<{ status: ReferralStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);
