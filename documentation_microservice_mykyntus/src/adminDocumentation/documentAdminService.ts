import {
  AdminGeneralConfig,
  AdminDocType,
  AdminPermissionPolicy,
  AdminWorkflowDefinition,
  AdminStorageConfig,
  AdminRole,
} from './documentAdminModels';
import {
  initialAdminGeneralConfig,
  initialAdminDocTypes,
  initialAdminPermissions,
  initialAdminStorageConfig,
  initialAdminWorkflowDefinitions,
} from './documentAdminMock';

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

let generalConfig: AdminGeneralConfig = deepClone(initialAdminGeneralConfig);
let docTypes: AdminDocType[] = deepClone(initialAdminDocTypes);
let workflowDefinitions: AdminWorkflowDefinition[] = deepClone(initialAdminWorkflowDefinitions);
let permissionPolicies: AdminPermissionPolicy[] = deepClone(initialAdminPermissions);
let storageConfig: AdminStorageConfig = deepClone(initialAdminStorageConfig);

const randomId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

export async function getGeneralConfig(): Promise<AdminGeneralConfig> {
  return deepClone(generalConfig);
}

export async function saveGeneralConfig(next: AdminGeneralConfig): Promise<AdminGeneralConfig> {
  generalConfig = deepClone(next);
  return deepClone(generalConfig);
}

export async function resetGeneralConfig(): Promise<AdminGeneralConfig> {
  generalConfig = deepClone(initialAdminGeneralConfig);
  return deepClone(generalConfig);
}

export async function getDocTypes(): Promise<AdminDocType[]> {
  return deepClone(docTypes);
}

export async function createDocType(payload: Omit<AdminDocType, 'id'>): Promise<AdminDocType> {
  const created: AdminDocType = { ...payload, id: randomId('dt') };
  docTypes = [created, ...docTypes];
  return deepClone(created);
}

export async function updateDocType(id: string, payload: Omit<AdminDocType, 'id'>): Promise<AdminDocType | null> {
  const idx = docTypes.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const updated: AdminDocType = { ...payload, id };
  docTypes = docTypes.map((d) => (d.id === id ? updated : d));
  return deepClone(updated);
}

export async function deleteDocType(id: string): Promise<boolean> {
  const before = docTypes.length;
  docTypes = docTypes.filter((d) => d.id !== id);
  // NOTE: on ne supprime pas automatiquement les policies: elles sont filtrées via docTypeId.
  return docTypes.length !== before;
}

export async function getWorkflowDefinitions(): Promise<AdminWorkflowDefinition[]> {
  return deepClone(workflowDefinitions);
}

export async function updateWorkflowDefinition(id: string, next: AdminWorkflowDefinition): Promise<AdminWorkflowDefinition | null> {
  const idx = workflowDefinitions.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const allowedRoles: AdminRole[] = ['Coach', 'Manager', 'RP', 'RH'];
  const allowedSet = new Set<AdminRole>(allowedRoles);
  const cleaned = next.steps
    .filter((s) => allowedSet.has(s.assignedRole))
    .map((s, i) => ({
      ...s,
      id: s.id || `wf-step-${i + 1}`,
      slaHours: Number.isFinite(s.slaHours) && s.slaHours >= 0 ? s.slaHours : 24,
      // Coach/Manager/RP: seules actions de validation (pas Approve/Reject).
      actions: s.assignedRole === 'RH' ? ['Approve', 'Reject', 'Archive'] : ['Validate'],
    }));
  const byRole = new Map(cleaned.map((s) => [s.assignedRole, s]));
  const ensure = (role: 'Coach' | 'Manager' | 'RP' | 'RH') =>
    byRole.get(role) ?? {
      id: `wf-step-${role.toLowerCase()}`,
      key: role,
      name: `Validation ${role}`,
      assignedRole: role,
      actions: role === 'RH' ? ['Approve', 'Reject', 'Archive'] : ['Validate'],
      slaHours: role === 'RH' ? 48 : 24,
      notificationKey: 'email' as const,
    };
  const normalized: AdminWorkflowDefinition = {
    ...next,
    steps: [ensure('Coach'), ensure('Manager'), ensure('RP'), { ...ensure('RH'), assignedRole: 'RH' }],
    auditAccess: {
      enabled: !!next.auditAccess?.enabled,
      readOnly: true,
      logs: !!next.auditAccess?.logs,
      history: !!next.auditAccess?.history,
      export: !!next.auditAccess?.export,
    },
  };
  workflowDefinitions = workflowDefinitions.map((w) => (w.id === id ? normalized : w));
  return deepClone(normalized);
}

export async function getPermissionPolicies(): Promise<AdminPermissionPolicy[]> {
  return deepClone(permissionPolicies);
}

export async function savePermissionPolicies(next: AdminPermissionPolicy[]): Promise<AdminPermissionPolicy[]> {
  permissionPolicies = deepClone(next);
  return deepClone(permissionPolicies);
}

export async function resetPermissionPolicies(): Promise<AdminPermissionPolicy[]> {
  permissionPolicies = deepClone(initialAdminPermissions);
  return deepClone(permissionPolicies);
}

export async function resetDocTypes(): Promise<AdminDocType[]> {
  docTypes = deepClone(initialAdminDocTypes);
  return deepClone(docTypes);
}

export async function resetWorkflows(): Promise<AdminWorkflowDefinition[]> {
  workflowDefinitions = deepClone(initialAdminWorkflowDefinitions);
  return deepClone(workflowDefinitions);
}

export async function getStorageConfig(): Promise<AdminStorageConfig> {
  return deepClone(storageConfig);
}

export async function saveStorageConfig(next: AdminStorageConfig): Promise<AdminStorageConfig> {
  storageConfig = deepClone(next);
  return deepClone(storageConfig);
}

export async function resetStorageConfig(): Promise<AdminStorageConfig> {
  storageConfig = deepClone(initialAdminStorageConfig);
  return deepClone(storageConfig);
}

export function getAdminRoles(): AdminRole[] {
  return ['Admin', 'RH', 'Coach', 'Manager', 'RP', 'Audit'];
}

