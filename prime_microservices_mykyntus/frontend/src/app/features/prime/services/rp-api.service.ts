import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { RpDashboardStats, RpTeamMemberPerformance, RpValidationItem } from '../../../shared/models/prime.models';

export interface UpdateRpValidationStatusRequest {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class RpApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/rp`;

  constructor(private readonly http: HttpClient) {}

  getAssignedProjectIds(rpUserId: string): Observable<string[]> {
    const params = new HttpParams().set('rpUserId', rpUserId);
    return this.http.get<string[]>(`${this.baseUrl}/assigned-project-ids`, { params });
  }

  getRpDashboardStats(rpUserId: string): Observable<RpDashboardStats> {
    const params = new HttpParams().set('rpUserId', rpUserId);
    return this.http.get<RpDashboardStats>(`${this.baseUrl}/dashboard-stats`, { params });
  }

  getTeamPerformanceByProject(rpUserId: string): Observable<RpTeamMemberPerformance[]> {
    const params = new HttpParams().set('rpUserId', rpUserId);
    return this.http.get<RpTeamMemberPerformance[]>(`${this.baseUrl}/team-performance`, { params });
  }

  getManagerValidatedPrimes(rpUserId: string): Observable<RpValidationItem[]> {
    const params = new HttpParams().set('rpUserId', rpUserId);
    return this.http.get<RpValidationItem[]>(`${this.baseUrl}/manager-validated`, { params });
  }

  updateRpValidationStatus(id: string, req: UpdateRpValidationStatusRequest): Observable<RpValidationItem> {
    return this.http.put<RpValidationItem>(`${this.baseUrl}/validations/${id}/status`, req);
  }
}

