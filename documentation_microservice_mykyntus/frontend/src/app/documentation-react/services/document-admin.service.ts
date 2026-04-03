import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type {
  AdminDocType,
  AdminGeneralConfig,
  AdminPermissionPolicy,
  AdminRole,
  AdminStorageConfig,
  AdminWorkflowDefinition,
  AdminWorkflowStep,
  WorkflowActionKey,
} from '../models/document-admin.models';
import { DocumentationAdminApiService, type CreateDocTypeRequestBody } from './documentation-admin-api.service';

const emptyAuditAccess = (): AdminWorkflowDefinition['auditAccess'] => ({
  enabled: false,
  readOnly: true,
  logs: false,
  history: false,
  export: false,
});

function mapWorkflowFromApi(w: AdminWorkflowDefinition): AdminWorkflowDefinition {
  return {
    ...w,
    auditAccess:
      w.auditAccess && typeof w.auditAccess === 'object' ? w.auditAccess : emptyAuditAccess(),
  };
}

@Injectable({ providedIn: 'root' })
export class DocumentAdminService {
  constructor(private readonly adminApi: DocumentationAdminApiService) {}

  async getGeneralConfig(): Promise<AdminGeneralConfig> {
    return firstValueFrom(this.adminApi.getGeneralConfig());
  }

  async saveGeneralConfig(next: AdminGeneralConfig): Promise<AdminGeneralConfig> {
    return firstValueFrom(this.adminApi.saveGeneralConfig(next));
  }

  async resetGeneralConfig(): Promise<AdminGeneralConfig> {
    return firstValueFrom(this.adminApi.resetGeneralConfig());
  }

  async getDocTypes(): Promise<AdminDocType[]> {
    return firstValueFrom(this.adminApi.getAdminDocTypes());
  }

  async createDocType(payload: Omit<AdminDocType, 'id'>): Promise<AdminDocType> {
    const body: CreateDocTypeRequestBody = {
      name: payload.name,
      code: payload.code,
      description: payload.description,
      department: payload.department,
      retentionDays: payload.retentionDays,
      workflowId: payload.workflowId,
      mandatory: payload.mandatory,
    };
    return firstValueFrom(this.adminApi.createAdminDocType(body));
  }

  async updateDocType(id: string, payload: Omit<AdminDocType, 'id'>): Promise<AdminDocType | null> {
    const body: CreateDocTypeRequestBody = {
      name: payload.name,
      code: payload.code,
      description: payload.description,
      department: payload.department,
      retentionDays: payload.retentionDays,
      workflowId: payload.workflowId,
      mandatory: payload.mandatory,
    };
    try {
      return await firstValueFrom(this.adminApi.updateAdminDocType(id, body));
    } catch {
      return null;
    }
  }

  async deleteDocType(id: string): Promise<boolean> {
    return firstValueFrom(this.adminApi.deleteAdminDocType(id));
  }

  async getWorkflowDefinitions(): Promise<AdminWorkflowDefinition[]> {
    const list = await firstValueFrom(this.adminApi.getWorkflowDefinitions());
    return list.map(mapWorkflowFromApi);
  }

  async updateWorkflowDefinition(
    id: string,
    next: AdminWorkflowDefinition,
  ): Promise<AdminWorkflowDefinition | null> {
    const allowedRoles: AdminRole[] = ['Coach', 'Manager', 'RP', 'RH'];
    const allowedSet = new Set<AdminRole>(allowedRoles);
    const cleaned: AdminWorkflowStep[] = next.steps
      .filter((s) => allowedSet.has(s.assignedRole))
      .map((s, i) => {
        const actions: WorkflowActionKey[] =
          s.assignedRole === 'RH' ? ['Approve', 'Reject', 'Archive'] : ['Validate'];
        return {
          ...s,
          id: s.id || `wf-step-${i + 1}`,
          slaHours: Number.isFinite(s.slaHours) && s.slaHours >= 0 ? s.slaHours : 24,
          actions,
        };
      });
    const byRole = new Map(cleaned.map((s) => [s.assignedRole, s] as const));
    type WfRole = 'Coach' | 'Manager' | 'RP' | 'RH';
    const ensure = (role: WfRole): AdminWorkflowStep => {
      const fallbackActions: WorkflowActionKey[] =
        role === 'RH' ? ['Approve', 'Reject', 'Archive'] : ['Validate'];
      return (
        byRole.get(role) ?? {
          id: `wf-step-${role.toLowerCase()}`,
          key: role,
          name: `Validation ${role}`,
          assignedRole: role,
          actions: fallbackActions,
          slaHours: role === 'RH' ? 48 : 24,
          notificationKey: 'email',
        }
      );
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
    try {
      const saved = await firstValueFrom(this.adminApi.updateWorkflowDefinition(id, normalized));
      return mapWorkflowFromApi(saved);
    } catch {
      return null;
    }
  }

  async getPermissionPolicies(): Promise<AdminPermissionPolicy[]> {
    return firstValueFrom(this.adminApi.getPermissionPolicies());
  }

  async savePermissionPolicies(next: AdminPermissionPolicy[]): Promise<AdminPermissionPolicy[]> {
    return firstValueFrom(this.adminApi.savePermissionPolicies(next));
  }

  async resetPermissionPolicies(): Promise<AdminPermissionPolicy[]> {
    return firstValueFrom(this.adminApi.resetPermissionPolicies());
  }

  async resetDocTypes(): Promise<AdminDocType[]> {
    return firstValueFrom(this.adminApi.resetAdminDocTypes());
  }

  async resetWorkflows(): Promise<AdminWorkflowDefinition[]> {
    const list = await firstValueFrom(this.adminApi.resetWorkflows());
    return list.map(mapWorkflowFromApi);
  }

  async getStorageConfig(): Promise<AdminStorageConfig> {
    return firstValueFrom(this.adminApi.getStorageConfig());
  }

  async saveStorageConfig(next: AdminStorageConfig): Promise<AdminStorageConfig> {
    return firstValueFrom(this.adminApi.saveStorageConfig(next));
  }

  async resetStorageConfig(): Promise<AdminStorageConfig> {
    return firstValueFrom(this.adminApi.resetStorageConfig());
  }

  async getAdminRoles(): Promise<AdminRole[]> {
    const roles = await firstValueFrom(this.adminApi.getAdminRoles());
    return roles as AdminRole[];
  }
}
