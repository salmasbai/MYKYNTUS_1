export type WorkflowAction = 'Validate' | 'Reject' | 'Approve' | 'Archive';
export type WorkflowRole = 'Coach' | 'Manager' | 'RP' | 'RH';

/** Mode de règles de primes (bascule RH). */
export type ReferralProgramMode = 'STANDARD' | 'CRITICAL_PERIOD';

/** Une tranche de prime (montant après X mois d’ancienneté du parrainage). */
export interface ReferralBonusTier {
  id: string;
  amountDH: number;
  afterMonths: number;
}

export interface ReferralProgramRules {
  activeMode: ReferralProgramMode;
  standardTiers: ReferralBonusTier[];
  criticalPeriodTiers: ReferralBonusTier[];
}

export interface WorkflowStepConfig {
  id: string;
  role: WorkflowRole;
  slaHours: number;
  actions: WorkflowAction[];
  notificationType: 'email' | 'in-app';
  notificationEnabled: boolean;
}

export interface SystemConfig {
  /** @deprecated Champs dérivés des règles programme (compatibilité). */
  defaultBonusAmount: number;
  /** @deprecated Champs dérivés des règles programme (compatibilité). */
  minDurationMonths: number;
  referralLimitPerEmployee: number;
  /** Règles dynamiques STANDARD / période critique (source de vérité pour les primes). */
  referralProgramRules?: ReferralProgramRules;
  /** Alert when SUBMITTED count exceeds this (operational dashboard). */
  pendingReferralAlertThreshold?: number;
  adminWorkflow?: {
    steps: WorkflowStepConfig[];
    auditAccess: {
      enabled: boolean;
      readOnly: boolean;
      logs: boolean;
      history: boolean;
      export: boolean;
    };
  };
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  defaultBonusAmount: 1500,
  minDurationMonths: 6,
  referralLimitPerEmployee: 10,
  pendingReferralAlertThreshold: 5,
  referralProgramRules: {
    activeMode: 'STANDARD',
    standardTiers: [{ id: 'tier-std-1', amountDH: 1500, afterMonths: 6 }],
    criticalPeriodTiers: [
      { id: 'tier-crit-1', amountDH: 500, afterMonths: 3 },
      { id: 'tier-crit-2', amountDH: 1000, afterMonths: 6 },
    ],
  },
  adminWorkflow: {
    steps: [
      { id: 'wf-coach', role: 'Coach', slaHours: 24, actions: ['Validate', 'Reject'], notificationType: 'email', notificationEnabled: true },
      { id: 'wf-manager', role: 'Manager', slaHours: 24, actions: ['Validate', 'Reject', 'Approve'], notificationType: 'email', notificationEnabled: true },
      { id: 'wf-rp', role: 'RP', slaHours: 24, actions: ['Approve', 'Reject'], notificationType: 'in-app', notificationEnabled: true },
      { id: 'wf-rh', role: 'RH', slaHours: 48, actions: ['Approve', 'Reject', 'Archive'], notificationType: 'email', notificationEnabled: true },
    ],
    auditAccess: { enabled: true, readOnly: true, logs: true, history: true, export: true },
  },
};

export interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  userLabel: string;
  timestamp: Date;
  details?: string;
}
