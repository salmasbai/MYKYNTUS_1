import { useMemo } from 'react';
import type { Referral } from '../models/Referral';

export function useReferralStats(referrals: Referral[]) {
  return useMemo(() => {
    const total = referrals.length;
    const validated = referrals.filter((r) => r.status === 'APPROVED' || r.status === 'REWARDED').length;
    const pending = referrals.filter((r) => r.status === 'SUBMITTED').length;
    const rejected = referrals.filter((r) => r.status === 'REJECTED').length;
    const totalBonusesPaid = referrals.filter((r) => r.status === 'REWARDED').reduce((s, r) => s + r.rewardAmount, 0);
    const successRate = total > 0 ? Math.round((validated / total) * 100) : 0;
    return { total, validated, pending, rejected, totalBonusesPaid, successRate };
  }, [referrals]);
}
