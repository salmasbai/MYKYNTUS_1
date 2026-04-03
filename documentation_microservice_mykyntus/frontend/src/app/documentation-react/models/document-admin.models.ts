export type AdminRole = 'Admin' | 'RH' | 'Manager' | 'Coach' | 'RP' | 'Audit';

export type WorkflowActionKey = 'Validate' | 'Reject' | 'Approve' | 'Archive';
export type WorkflowNotificationKey = 'email' | 'none';

export interface AdminGeneralConfig {
  systemName: string;
  defaultLanguage: string;
  defaultTimezone: string;
  maxFileSizeMB: number;
  allowedFileTypes: string[];
  versioningEnabled: boolean;
  retentionDays: number;
  documentsMandatoryByType: boolean;
  autoNumberingEnabled: boolean;
  numberingPattern: string;
  security: {
    encryptionEnabled: boolean;
    externalSharingEnabled: boolean;
    electronicSignatureEnabled: boolean;
  };
  notifications: {
    emailOnUpload: boolean;
    emailOnValidation: boolean;
    emailOnRejection: boolean;
    reminderExpiredEnabled: boolean;
  };
}

export interface AdminDocType {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  retentionDays: number;
  workflowId: string;
  mandatory: boolean;
}

export interface AdminPermissionSet {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  validate: boolean;
}

export interface AdminPermissionPolicy {
  id: string;
  role: AdminRole;
  docTypeId?: string;
  department?: string;
  permissions: AdminPermissionSet;
}

export interface AdminWorkflowStep {
  id: string;
  key: string;
  name: string;
  assignedRole: AdminRole;
  actions: WorkflowActionKey[];
  slaHours: number;
  notificationKey: WorkflowNotificationKey;
}

export interface AdminWorkflowDefinition {
  id: string;
  name: string;
  steps: AdminWorkflowStep[];
  auditAccess: {
    enabled: boolean;
    readOnly: boolean;
    logs: boolean;
    history: boolean;
    export: boolean;
  };
}

export type AdminStorageType = 'Local' | 'Cloud';

export interface AdminStorageConfig {
  storageType: AdminStorageType;
  apiUrl: string;
  bucketName: string;
  region: string;
  accessKey: string;
  backupEnabled: boolean;
  compressionEnabled: boolean;
}
