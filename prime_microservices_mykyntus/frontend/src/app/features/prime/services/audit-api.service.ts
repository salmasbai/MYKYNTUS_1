import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { AuditAnomaly, AuditDashboardResponse, AuditOperation, AuditTrailLog } from '../../../shared/models/prime.models';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/audit`;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<AuditDashboardResponse> {
    return this.http.get<AuditDashboardResponse>(`${this.baseUrl}/dashboard`);
  }

  getOperations(): Observable<AuditOperation[]> {
    return this.http.get<AuditOperation[]>(`${this.baseUrl}/operations`);
  }

  getAuditTrailLogs(): Observable<AuditTrailLog[]> {
    return this.http.get<AuditTrailLog[]>(`${this.baseUrl}/trail-logs`);
  }

  getAnomalies(): Observable<AuditAnomaly[]> {
    return this.http.get<AuditAnomaly[]>(`${this.baseUrl}/anomalies`);
  }
}

