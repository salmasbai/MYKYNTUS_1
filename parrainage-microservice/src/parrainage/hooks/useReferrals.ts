import { useAuth } from '../../../frontend/app/hooks/useAuth';
import { useScopedReferrals } from '@parrainage/core/hooks/useScopedReferrals';

/**
 * Wraps useScopedReferrals with user from useAuth.
 * Scoping is applied automatically (ADMIN/RH: all, PM: by project, PILOTE: own only).
 */
export function useReferrals(_projectId?: string) {
  const { user } = useAuth();
  return useScopedReferrals(user);
}
