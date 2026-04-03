export interface AdminSystemKpi {
  totalGeneratedPrimes: number;
  validationsInProgress: number;
  errorCount: number;
  avgProcessingTimeSec: number;
}

export interface AdminSystemAlert {
  id: string;
  type: 'Erreur systeme' | 'Incoherence' | 'Workflow bloque';
  message: string;
  severity: 'Haute' | 'Moyenne' | 'Faible';
  date: string;
}

export interface AdminCalculationConfig {
  formula: string;
  weights: {
    individualPerformance: number;
    teamPerformance: number;
    objectives: number;
  };
  parameters: {
    cap: number;
    minThreshold: number;
    bonus: number;
  };
}

export interface AdminAuditLog {
  id: string;
  user: string;
  action: string;
  date: string;
}

export interface AdminAnomaly {
  id: string;
  type: 'Erreur de calcul' | 'Donnee manquante';
  description: string;
  status: 'Ouverte' | 'Corrigee' | 'Ignoree';
}

export const mockAdminSystemKpis: AdminSystemKpi = {
  totalGeneratedPrimes: 1486,
  validationsInProgress: 73,
  errorCount: 12,
  avgProcessingTimeSec: 42,
};

export const mockAdminCharts = {
  volumeByMonth: [
    { month: 'Oct', value: 980 },
    { month: 'Nov', value: 1050 },
    { month: 'Dec', value: 1125 },
    { month: 'Jan', value: 1180 },
    { month: 'Feb', value: 1260 },
    { month: 'Mar', value: 1486 },
  ],
  validationRate: [
    { month: 'Oct', value: 81 },
    { month: 'Nov', value: 84 },
    { month: 'Dec', value: 86 },
    { month: 'Jan', value: 88 },
    { month: 'Feb', value: 90 },
    { month: 'Mar', value: 92 },
  ],
  byDepartment: [
    { name: 'Operations', value: 52 },
    { name: 'IT', value: 31 },
    { name: 'RH', value: 17 },
  ],
};

export const mockAdminAlerts: AdminSystemAlert[] = [
  { id: 'alt1', type: 'Erreur systeme', message: 'Timeout moteur calcul sur lot #M2026-03-13', severity: 'Haute', date: '2026-03-21 09:45' },
  { id: 'alt2', type: 'Incoherence', message: 'Scores manquants pour 3 employes (projet Alpha)', severity: 'Moyenne', date: '2026-03-21 10:15' },
  { id: 'alt3', type: 'Workflow bloque', message: 'Validation RP en attente > SLA (48h)', severity: 'Moyenne', date: '2026-03-21 11:02' },
];

export const mockAdminCalculationConfig: AdminCalculationConfig = {
  formula: '(ind_perf * w1) + (team_perf * w2) + (obj * w3) + bonus',
  weights: {
    individualPerformance: 50,
    teamPerformance: 30,
    objectives: 20,
  },
  parameters: {
    cap: 1200,
    minThreshold: 65,
    bonus: 100,
  },
};

export const mockAdminRbacMatrix = [
  { role: 'Admin', read: true, edit: true, validate: true, configure: true },
  { role: 'RH', read: true, edit: true, validate: true, configure: false },
  { role: 'Manager', read: true, edit: false, validate: true, configure: false },
  { role: 'RP', read: true, edit: false, validate: true, configure: false },
];

export const WORKFLOW_ACTIONS = ['Validate', 'Reject', 'Approve', 'Archive'] as const;
export type WorkflowAction = (typeof WORKFLOW_ACTIONS)[number];

export const WORKFLOW_STEP_ROLES = ['Coach', 'Manager', 'RP'] as const;
export type WorkflowStepRole = (typeof WORKFLOW_STEP_ROLES)[number];

export interface AdminWorkflowStepConfig {
  id: string;
  role: WorkflowStepRole | 'RH';
  slaHours: number;
  actions: WorkflowAction[];
  notificationType: 'email' | 'in-app';
  notificationEnabled: boolean;
}

export interface AdminWorkflowConfig {
  steps: AdminWorkflowStepConfig[];
  auditAccess: {
    enabled: boolean;
    readOnly: boolean;
    logs: boolean;
    history: boolean;
    export: boolean;
  };
}

export const mockAdminWorkflow: AdminWorkflowConfig = {
  steps: [
    { id: 'wf-coach', role: 'Coach', slaHours: 24, actions: ['Validate', 'Reject'], notificationType: 'email', notificationEnabled: true },
    { id: 'wf-manager', role: 'Manager', slaHours: 24, actions: ['Validate', 'Reject', 'Approve'], notificationType: 'email', notificationEnabled: true },
    { id: 'wf-rp', role: 'RP', slaHours: 24, actions: ['Approve', 'Reject'], notificationType: 'in-app', notificationEnabled: true },
    { id: 'wf-rh-final', role: 'RH', slaHours: 48, actions: ['Approve', 'Reject', 'Archive'], notificationType: 'email', notificationEnabled: true },
  ],
  auditAccess: {
    enabled: true,
    readOnly: true,
    logs: true,
    history: true,
    export: true,
  },
};

export const mockAdminAuditLogs: AdminAuditLog[] = [
  { id: 'log1', user: 'admin@mykyntus.com', action: 'Mise a jour formule de calcul', date: '2026-03-22 14:04' },
  { id: 'log2', user: 'eve.thomas@mykyntus.com', action: 'Validation RH du lot M-2026-03', date: '2026-03-22 15:16' },
  { id: 'log3', user: 'charlie.durand@mykyntus.com', action: 'Validation manager du lot M-2026-03', date: '2026-03-22 16:28' },
];

export const mockAdminAnomalies: AdminAnomaly[] = [
  { id: 'an1', type: 'Erreur de calcul', description: 'Division par zero detectee sur formule legacy', status: 'Ouverte' },
  { id: 'an2', type: 'Donnee manquante', description: 'Objectif mensuel absent pour e2', status: 'Ouverte' },
  { id: 'an3', type: 'Erreur de calcul', description: 'Score hors bornes sur lot M2026-02', status: 'Corrigee' },
];
