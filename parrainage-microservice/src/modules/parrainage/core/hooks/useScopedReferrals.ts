import { useEffect, useState, useCallback } from 'react';
import { ReferralService } from '../services/ReferralService';
import { getScopedReferrals, type UserForScoping } from '../../shared/utils/scoping';
import type { Referral } from '../models/Referral';
import { useParrainageHierarchyDrill } from '../../shared/contexts/ParrainageHierarchyDrillContext';

/**
 * Fetches referrals and applies role-based scoping.
 * Component → Hook → Service → localStorage
 */
export function useScopedReferrals(user: UserForScoping | null | undefined) {
  const { drill } = useParrainageHierarchyDrill();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    const all = ReferralService.getAllReferrals();
    const scoped = getScopedReferrals(all, user as UserForScoping | undefined, drill);
    setReferrals(scoped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    setLoading(false);
  }, [user, drill.managerId, drill.coachId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { referrals, loading, refresh };
}
