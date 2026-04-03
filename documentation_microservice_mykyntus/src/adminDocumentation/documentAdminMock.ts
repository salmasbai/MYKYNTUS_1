import { AdminGeneralConfig, AdminDocType, AdminPermissionPolicy, AdminWorkflowDefinition, AdminStorageConfig } from './documentAdminModels';

export const initialAdminGeneralConfig: AdminGeneralConfig = {
  systemName: 'MyKyntus DMS',
  defaultLanguage: 'fr',
  defaultTimezone: 'Europe/Paris',
  maxFileSizeMB: 25,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'png', 'jpg'],

  versioningEnabled: true,
  retentionDays: 365,
  documentsMandatoryByType: true,
  autoNumberingEnabled: true,
  numberingPattern: 'DOC-{YEAR}-{SEQ}',

  security: {
    encryptionEnabled: true,
    externalSharingEnabled: false,
    electronicSignatureEnabled: true,
  },

  notifications: {
    emailOnUpload: true,
    emailOnValidation: true,
    emailOnRejection: true,
    reminderExpiredEnabled: true,
  },
};

export const initialAdminDocTypes: AdminDocType[] = [
  {
    id: 'dt-work-cert',
    name: 'Work Certificate',
    code: 'WORK_CERT',
    description: 'Attestation de travail standard.',
    department: 'Engineering',
    retentionDays: 730,
    workflowId: 'wf-default',
    mandatory: true,
  },
  {
    id: 'dt-salary-cert',
    name: 'Salary Certificate',
    code: 'SALARY_CERT',
    description: 'Attestation de salaire.',
    department: 'HR',
    retentionDays: 1825,
    workflowId: 'wf-default',
    mandatory: true,
  },
  {
    id: 'dt-training-cert',
    name: 'Training Certificate',
    code: 'TRAINING_CERT',
    description: 'Certificat de formation.',
    department: 'Sales',
    retentionDays: 365,
    workflowId: 'wf-default',
    mandatory: false,
  },
];

export const initialAdminWorkflowDefinitions: AdminWorkflowDefinition[] = [
  {
    id: 'wf-default',
    name: 'Workflow documentaire par défaut',
    steps: [
      {
        id: 'wf-step-coach',
        key: 'Coach',
        name: 'Validation Coach',
        assignedRole: 'Coach',
        slaHours: 24,
        actions: ['Validate'],
        notificationKey: 'email',
      },
      {
        id: 'wf-step-manager',
        key: 'Manager',
        name: 'Validation Manager',
        assignedRole: 'Manager',
        actions: ['Validate'],
        slaHours: 24,
        notificationKey: 'email',
      },
      {
        id: 'wf-step-rp',
        key: 'RP',
        name: 'Validation RP',
        assignedRole: 'RP',
        actions: ['Validate'],
        slaHours: 24,
        notificationKey: 'email',
      },
      {
        id: 'wf-step-rh',
        key: 'RH',
        name: 'Validation RH',
        assignedRole: 'RH',
        actions: ['Approve', 'Reject', 'Archive'],
        slaHours: 48,
        notificationKey: 'email',
      },
    ],
    auditAccess: {
      enabled: true,
      readOnly: true,
      logs: true,
      history: true,
      export: true,
    },
  },
];

export const initialAdminPermissions: AdminPermissionPolicy[] = [
  // Admin: tout autorisé (ALL)
  {
    id: 'p-admin-all',
    role: 'Admin',
    permissions: { read: true, create: true, update: true, delete: true, validate: true },
  },
  // RH: autorise la validation, mais pas la suppression pour certains périmètres (mix)
  {
    id: 'p-rh-all',
    role: 'RH',
    permissions: { read: true, create: true, update: true, delete: false, validate: true },
  },
  // Manager: lecture + création + validation, sans suppression
  {
    id: 'p-manager-all',
    role: 'Manager',
    permissions: { read: true, create: true, update: true, delete: false, validate: true },
  },
  // Audit: uniquement lecture
  {
    id: 'p-audit-all',
    role: 'Audit',
    permissions: { read: true, create: false, update: false, delete: false, validate: false },
  },

  // Overrides pour montrer l'intérêt des filtres
  {
    id: 'p-rh-salary-hr',
    role: 'RH',
    docTypeId: 'dt-salary-cert',
    department: 'HR',
    permissions: { read: true, create: true, update: true, delete: false, validate: true },
  },
  {
    id: 'p-manager-work-eng',
    role: 'Manager',
    docTypeId: 'dt-work-cert',
    department: 'Engineering',
    permissions: { read: true, create: true, update: false, delete: false, validate: true },
  },
];

export const initialAdminStorageConfig: AdminStorageConfig = {
  storageType: 'Cloud',
  apiUrl: 'https://api.kyntus.local/documents',
  bucketName: 'mykyntus-dms-prod',
  region: 'eu-west-1',
  accessKey: 'AKIA****REDACTED',
  backupEnabled: true,
  compressionEnabled: true,
};

