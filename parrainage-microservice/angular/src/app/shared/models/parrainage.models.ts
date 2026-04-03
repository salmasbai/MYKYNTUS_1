export type RoleFilter = 'PILOTE' | 'RH' | 'ADMIN' | 'PROJECT_MANAGER';
export type NotificationAudienceRole = RoleFilter | 'ALL';

export type ReferralStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REWARDED';
export type ReferralHistoryAction = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REWARDED';

export type ReferralRuleType = 'REWARD_PER_POSITION' | 'REWARD_AFTER_PROBATION';
export type ReferralRuleStatus = 'ACTIVE' | 'PAUSED';

export type ReferralNotificationType = 'NEW_REFERRAL' | 'STATUS_CHANGED' | 'REFERRAL_REWARDED';

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
  createdAt: string;
}

export interface ReferralHistoryEntry {
  id: string;
  referralId: string;
  candidateName: string;
  action: ReferralHistoryAction;
  performedById: string;
  performedByLabel: string;
  createdAt: string;
  comment?: string;
  rewardAmount?: number;
}

export interface ReferralRule {
  id: string;
  name: string;
  type: ReferralRuleType;
  value: number;
  target?: string;
  status: ReferralRuleStatus;
  createdAt: string;
}

export interface ReferralNotification {
  id: string;
  type: ReferralNotificationType;
  message: string;
  createdAt: string;
  read: boolean;
  referralId?: string;
  referrerId?: string;
  targetRoles?: NotificationAudienceRole[];
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  systemAlerts?: boolean;
  referrals?: boolean;
  approvals?: boolean;
  payments?: boolean;
}

export interface SystemConfig {
  defaultBonusAmount: number;
  minDurationMonths: number;
  referralLimitPerEmployee: number;
  pendingReferralAlertThreshold?: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  userLabel: string;
  timestamp: string;
  details?: string;
}

export interface UiPreferences {
  compactMode: boolean;
}

