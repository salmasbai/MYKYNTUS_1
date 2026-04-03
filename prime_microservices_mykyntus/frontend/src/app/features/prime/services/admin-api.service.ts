import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type {
  AdminAnomaly,
  AdminAuditLog,
  AdminCalculationConfig,
  AdminDashboardResponse,
  AdminRbacRow,
  AdminWorkflowConfig,
} from '../../../shared/models/prime.models';

export interface ToggleRbacPermissionRequest {
  role: string;
  permission: 'read' | 'edit' | 'validate' | 'configure' | string;
}

export interface UpdateAnomalyStatusRequest {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin`;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.baseUrl}/dashboard`);
  }

  getCalculationConfig(): Observable<AdminCalculationConfig> {
    return this.http.get<AdminCalculationConfig>(`${this.baseUrl}/calculation-config`);
  }

  saveCalculationConfig(payload: AdminCalculationConfig): Observable<AdminCalculationConfig> {
    return this.http.put<AdminCalculationConfig>(`${this.baseUrl}/calculation-config`, payload);
  }

  getRbacMatrix(): Observable<AdminRbacRow[]> {
    return this.http.get<AdminRbacRow[]>(`${this.baseUrl}/rbac-matrix`);
  }

  toggleRbacPermission(req: ToggleRbacPermissionRequest): Observable<AdminRbacRow[]> {
    return this.http.put<AdminRbacRow[]>(`${this.baseUrl}/rbac-matrix/toggle`, req);
  }

  getWorkflowConfig(): Observable<AdminWorkflowConfig> {
    return this.http.get<AdminWorkflowConfig>(`${this.baseUrl}/workflow-config`);
  }

  saveWorkflowConfig(payload: AdminWorkflowConfig): Observable<AdminWorkflowConfig> {
    return this.http.put<AdminWorkflowConfig>(`${this.baseUrl}/workflow-config`, payload);
  }

  getAuditLogs(): Observable<AdminAuditLog[]> {
    return this.http.get<AdminAuditLog[]>(`${this.baseUrl}/audit-logs`);
  }

  getAnomalies(): Observable<AdminAnomaly[]> {
    return this.http.get<AdminAnomaly[]>(`${this.baseUrl}/anomalies`);
  }

  updateAnomalyStatus(id: string, req: UpdateAnomalyStatusRequest): Observable<AdminAnomaly[]> {
    return this.http.put<AdminAnomaly[]>(`${this.baseUrl}/anomalies/${id}/status`, req);
  }
}

