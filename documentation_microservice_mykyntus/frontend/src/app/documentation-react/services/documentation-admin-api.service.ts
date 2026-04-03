import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  AdminDocType,
  AdminGeneralConfig,
  AdminPermissionPolicy,
  AdminStorageConfig,
  AdminWorkflowDefinition,
} from '../models/document-admin.models';

export interface CreateDocTypeRequestBody {
  name: string;
  code: string;
  description: string;
  department: string;
  retentionDays: number;
  workflowId: string;
  mandatory: boolean;
}

/** Client HTTP pour le contrôleur d’administration `api/documentation` (hors `/data`). */
@Injectable({ providedIn: 'root' })
export class DocumentationAdminApiService {
  private readonly root = `${environment.apiBaseUrl}/api/documentation`;

  constructor(private readonly http: HttpClient) {}

  getGeneralConfig(): Observable<AdminGeneralConfig> {
    return this.http.get<AdminGeneralConfig>(`${this.root}/general-config`);
  }

  saveGeneralConfig(body: AdminGeneralConfig): Observable<AdminGeneralConfig> {
    return this.http.put<AdminGeneralConfig>(`${this.root}/general-config`, body);
  }

  resetGeneralConfig(): Observable<AdminGeneralConfig> {
    return this.http.post<AdminGeneralConfig>(`${this.root}/general-config/reset`, {});
  }

  getAdminDocTypes(): Observable<AdminDocType[]> {
    return this.http.get<AdminDocType[]>(`${this.root}/doc-types`);
  }

  createAdminDocType(body: CreateDocTypeRequestBody): Observable<AdminDocType> {
    return this.http.post<AdminDocType>(`${this.root}/doc-types`, body);
  }

  updateAdminDocType(id: string, body: CreateDocTypeRequestBody): Observable<AdminDocType> {
    return this.http.put<AdminDocType>(`${this.root}/doc-types/${encodeURIComponent(id)}`, body);
  }

  deleteAdminDocType(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.root}/doc-types/${encodeURIComponent(id)}`);
  }

  resetAdminDocTypes(): Observable<AdminDocType[]> {
    return this.http.post<AdminDocType[]>(`${this.root}/doc-types/reset`, {});
  }

  getWorkflowDefinitions(): Observable<AdminWorkflowDefinition[]> {
    return this.http.get<AdminWorkflowDefinition[]>(`${this.root}/workflow-definitions`);
  }

  updateWorkflowDefinition(id: string, body: AdminWorkflowDefinition): Observable<AdminWorkflowDefinition> {
    return this.http.put<AdminWorkflowDefinition>(
      `${this.root}/workflow-definitions/${encodeURIComponent(id)}`,
      body,
    );
  }

  resetWorkflows(): Observable<AdminWorkflowDefinition[]> {
    return this.http.post<AdminWorkflowDefinition[]>(`${this.root}/workflow-definitions/reset`, {});
  }

  getPermissionPolicies(): Observable<AdminPermissionPolicy[]> {
    return this.http.get<AdminPermissionPolicy[]>(`${this.root}/permission-policies`);
  }

  savePermissionPolicies(body: AdminPermissionPolicy[]): Observable<AdminPermissionPolicy[]> {
    return this.http.put<AdminPermissionPolicy[]>(`${this.root}/permission-policies`, body);
  }

  resetPermissionPolicies(): Observable<AdminPermissionPolicy[]> {
    return this.http.post<AdminPermissionPolicy[]>(`${this.root}/permission-policies/reset`, {});
  }

  getStorageConfig(): Observable<AdminStorageConfig> {
    return this.http.get<AdminStorageConfig>(`${this.root}/storage-config`);
  }

  saveStorageConfig(body: AdminStorageConfig): Observable<AdminStorageConfig> {
    return this.http.put<AdminStorageConfig>(`${this.root}/storage-config`, body);
  }

  resetStorageConfig(): Observable<AdminStorageConfig> {
    return this.http.post<AdminStorageConfig>(`${this.root}/storage-config/reset`, {});
  }

  getAdminRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.root}/admin-roles`);
  }
}
