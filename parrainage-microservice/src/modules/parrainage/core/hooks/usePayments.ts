import { useCallback, useEffect, useState } from 'react';
import { ReferralService } from '../services/ReferralService';
import { getScopedReferrals, type UserForScoping } from '../../shared/utils/scoping';
import type { Referral } from '../models/Referral';
import { useParrainageHierarchyDrill } from '../../shared/contexts/ParrainageHierarchyDrillContext';

interface PaymentItem {
  referral: Referral;
  amount: number;
  isPaid: boolean;
}

export function usePayments(user: UserForScoping | null | undefined) {
  const { drill } = useParrainageHierarchyDrill();
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    if (
      user?.role === 'MANAGER' ||
      user?.role === 'COACH' ||
      user?.role === 'RP' ||
      user?.role === 'PILOTE' ||
      user?.role === 'RH'
    ) {
      setItems([]);
      setLoading(false);
      return;
    }
    const all = ReferralService.getAllReferrals();
    const scoped = getScopedReferrals(all, user, drill);
    const payables = scoped.filter((r) => (r.status === 'APPROVED' || r.status === 'REWARDED') && (r.rewardAmount > 0 || ReferralService.getSuggestedReward(r.id) > 0));
    setItems(
      payables.map((r) => ({
        referral: r,
        amount: r.rewardAmount || ReferralService.getSuggestedReward(r.id),
        isPaid: r.status === 'REWARDED',
      }))
    );
    setLoading(false);
  }, [user, drill.managerId, drill.coachId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markPaid = useCallback(
    (referralId: string) => {
      const r = items.find((x) => x.referral.id === referralId)?.referral;
      if (!r || r.status !== 'APPROVED') return;
      const amount = ReferralService.getSuggestedReward(referralId);
      ReferralService.assignReward(referralId, amount, { id: user?.id ?? 'admin-1', label: 'Admin' });
      refresh();
    },
    [items, user?.id, refresh]
  );

  return { items, loading, refresh, markPaid };
}
