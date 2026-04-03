import { useRole } from './useRole';

type Permission =
  | 'create_referral'
  | 'view_own_referrals'
  | 'view_all_referrals'
  | 'update_referral'
  | 'delete_referral'
  | 'validate_referral'
  | 'system_config'
  | 'read_only_audit';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  EMPLOYEE: ['create_referral', 'view_own_referrals'],
  PILOTE: ['create_referral', 'view_own_referrals'],
  RH: [
    'create_referral',
    'view_own_referrals',
    'view_all_referrals',
    'update_referral',
    'delete_referral',
    'validate_referral',
  ],
  ADMIN: ['system_config', 'view_all_referrals'],
  RP: ['view_all_referrals'],
  MANAGER: ['view_all_referrals'],
  COACH: ['view_all_referrals'],
  AUDIT: ['read_only_audit', 'view_all_referrals'],
};

export const usePermissions = () => {
  const { role } = useRole();
  const list = role ? ROLE_PERMISSIONS[role] ?? [] : [];

  const can = (perm: Permission) => list.includes(perm);

  return { can, permissions: list };
};

