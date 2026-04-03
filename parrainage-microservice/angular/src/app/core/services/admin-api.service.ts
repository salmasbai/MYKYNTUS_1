import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { AuditLogEntry, SystemConfig, UiPreferences } from '../../shared/models/parrainage.models';

export interface UpdateSystemConfigRequest extends SystemConfig {
  actorId: string;
  actorLabel: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/parrainage`;

  constructor(private readonly http: HttpClient) {}

  getSystemConfig(): Observable<SystemConfig> {
    return this.http.get<SystemConfig>(`${this.baseUrl}/system/config`);
  }

  updateSystemConfig(payload: UpdateSystemConfigRequest): Observable<SystemConfig> {
    return this.http.put<SystemConfig>(`${this.baseUrl}/system/config`, payload);
  }

  getAuditLogs(): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${this.baseUrl}/system/audit-logs`);
  }

  getUiPreferences(): Observable<UiPreferences> {
    return this.http.get<UiPreferences>(`${this.baseUrl}/ui/prefs`);
  }

  setUiPreferences(payload: UiPreferences): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/ui/prefs`, payload);
  }

  getAnomalies(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/admin/anomalies`);
  }

  exportSnapshot(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/admin/export-snapshot`);
  }
}

