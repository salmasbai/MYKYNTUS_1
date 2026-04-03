export type ReferralStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REWARDED';

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  projectId: string;
  projectName: string;
  teamId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  position: string;
  status: ReferralStatus;
  rewardAmount: number;
  cvUrl?: string;
  createdAt: Date;
}

export type ReferralHistoryAction = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REWARDED';

export interface ReferralHistoryEntry {
  id: string;
  referralId: string;
  candidateName: string;
  action: ReferralHistoryAction;
  performedById: string;
  performedByLabel: string;
  createdAt: Date;
  comment?: string;
  rewardAmount?: number;
}

export type NotificationAudienceRole =
  | 'PILOTE'
  | 'RH'
  | 'ADMIN'
  | 'MANAGER'
  | 'COACH'
  | 'RP'
  | 'ALL';

export interface ReferralNotification {
  id: string;
  type: 'NEW_REFERRAL' | 'STATUS_CHANGED' | 'REFERRAL_REWARDED';
  message: string;
  createdAt: Date;
  read: boolean;
  referralId?: string;
  /** Parrain (for filtering Pilote inbox). */
  referrerId?: string;
  /** If omitted, notification is shown to all roles (legacy). */
  targetRoles?: NotificationAudienceRole[];
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  systemAlerts?: boolean;
  /** Granular toggles (default true). */
  referrals?: boolean;
  approvals?: boolean;
  payments?: boolean;
}

export type ReferralRuleType = 'REWARD_PER_POSITION' | 'REWARD_AFTER_PROBATION';

export type ReferralRuleStatus = 'ACTIVE' | 'PAUSED';

export interface ReferralRule {
  id: string;
  name: string;
  type: ReferralRuleType;
  value: number;
  target?: string;
  status: ReferralRuleStatus;
  createdAt: Date;
}
