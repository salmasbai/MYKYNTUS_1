export type AuditValidationStepRole = 'Manager' | 'RP' | 'RH';

export interface AuditValidationStep {
  role: AuditValidationStepRole;
  status: 'OK' | 'REJECTED';
  date: string; // ISO
}

export interface AuditOperation {
  id: string;
  employeeName: string;
  projectName: string;
  steps: AuditValidationStep[];
  validatedBy: string; // dernier valideur
  date: string; // date de l'operation
  status: 'Validé' | 'Rejeté' | 'En cours';
}

export interface AuditTrailLog {
  id: string;
  user: string;
  action: string;
  date: string; // ISO
  detail: string;
}

export type AuditAnomalyType = 'Incohérence' | 'Erreur de calcul' | 'Validation manquante';

export interface AuditAnomaly {
  id: string;
  type: AuditAnomalyType;
  description: string;
  validationId?: string;
  status: 'Ouverte' | 'Corrigée';
}

export const mockAuditKpis = {
  totalPrimes: 1486,
  validations: 312,
  anomalies: 7,
  conformityRate: 93, // %
};

export const mockAuditCharts = {
  flowByStep: [
    { step: 'Manager', value: 200 },
    { step: 'RP', value: 180 },
    { step: 'RH', value: 170 },
  ],
  validationVsRejection: [
    { name: 'Validé', value: 282 },
    { name: 'Rejeté', value: 30 },
  ],
  activityByRole: [
    { role: 'Manager', value: 120 },
    { role: 'RP', value: 95 },
    { role: 'RH', value: 85 },
  ],
};

export const mockAuditOperations: AuditOperation[] = [
  {
    id: 'op1',
    employeeName: 'Alice Dupont',
    projectName: 'Projet Alpha',
    steps: [
      { role: 'Manager', status: 'OK', date: '2026-03-10T09:40:00.000Z' },
      { role: 'RP', status: 'OK', date: '2026-03-11T10:05:00.000Z' },
      { role: 'RH', status: 'OK', date: '2026-03-12T11:20:00.000Z' },
    ],
    validatedBy: 'RH',
    date: '2026-03-12',
    status: 'Validé',
  },
  {
    id: 'op2',
    employeeName: 'Bob Martin',
    projectName: 'Projet Alpha',
    steps: [
      { role: 'Manager', status: 'OK', date: '2026-03-10T08:15:00.000Z' },
      { role: 'RP', status: 'REJECTED', date: '2026-03-11T09:00:00.000Z' },
    ],
    validatedBy: 'RP',
    date: '2026-03-11',
    status: 'Rejeté',
  },
  {
    id: 'op3',
    employeeName: 'Diana Bernard',
    projectName: 'Projet Alpha',
    steps: [
      { role: 'Manager', status: 'OK', date: '2026-03-07T07:35:00.000Z' },
      { role: 'RP', status: 'OK', date: '2026-03-08T08:25:00.000Z' },
    ],
    validatedBy: 'RP',
    date: '2026-03-08',
    status: 'En cours',
  },
  {
    id: 'op4',
    employeeName: 'Bob Martin',
    projectName: 'Projet Alpha',
    steps: [
      { role: 'Manager', status: 'OK', date: '2026-02-27T12:10:00.000Z' },
      { role: 'RP', status: 'OK', date: '2026-02-28T13:05:00.000Z' },
      { role: 'RH', status: 'REJECTED', date: '2026-02-28T14:55:00.000Z' },
    ],
    validatedBy: 'RH',
    date: '2026-02-28',
    status: 'Rejeté',
  },
  {
    id: 'op5',
    employeeName: 'Alice Dupont',
    projectName: 'Projet Alpha',
    steps: [
      { role: 'Manager', status: 'OK', date: '2026-02-18T10:05:00.000Z' },
    ],
    validatedBy: 'Manager',
    date: '2026-02-18',
    status: 'En cours',
  },
];

export const mockAuditTrailLogs: AuditTrailLog[] = [
  {
    id: 'log-a1',
    user: 'salma.bennani@mykyntus.com',
    action: 'Audit: consultation et export',
    date: '2026-03-22T09:12:00.000Z',
    detail: 'Lecture des opérations pour le périmètre Projet Alpha.',
  },
  {
    id: 'log-a2',
    user: 'charlie.durand@mykyntus.com',
    action: 'Workflow: validation Manager',
    date: '2026-03-10T09:40:00.000Z',
    detail: 'Validation de l’étape Manager sur op1.',
  },
  {
    id: 'log-a3',
    user: 'rachid.elamrani@mykyntus.com',
    action: 'Workflow: validation RP',
    date: '2026-03-11T10:05:00.000Z',
    detail: 'Validation de l’étape RP sur op1.',
  },
  {
    id: 'log-a4',
    user: 'eve.thomas@mykyntus.com',
    action: 'Workflow: validation RH',
    date: '2026-03-12T11:20:00.000Z',
    detail: 'Validation de l’étape RH sur op1.',
  },
];

export const mockAuditAnomalies: AuditAnomaly[] = [
  {
    id: 'anom-1',
    type: 'Incohérence',
    description: 'Une étape RP manquante a été détectée après validation Manager.',
    validationId: 'op3',
    status: 'Ouverte',
  },
  {
    id: 'anom-2',
    type: 'Erreur de calcul',
    description: 'Score hors bornes sur l’intervalle 2026-02.',
    validationId: 'op4',
    status: 'Ouverte',
  },
  {
    id: 'anom-3',
    type: 'Validation manquante',
    description: 'Validation RH non enregistrée sur op5.',
    validationId: 'op5',
    status: 'Ouverte',
  },
  {
    id: 'anom-4',
    type: 'Incohérence',
    description: 'Rejet sans motif détaillé disponible.',
    validationId: 'op2',
    status: 'Corrigée',
  },
];

