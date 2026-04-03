import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type {
  Department,
  Employee,
  PrimeDashboardStats,
  PrimeResult,
  PrimeRule,
  PrimeType,
} from '../../../shared/models/prime.models';

export interface UpdatePrimeResultStatusRequest {
  status: string;
  approvedBy?: string;
}

@Injectable({ providedIn: 'root' })
export class PrimeApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/prime`;

  constructor(private readonly http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`);
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`);
  }

  getPrimeTypes(): Observable<PrimeType[]> {
    return this.http.get<PrimeType[]>(`${this.baseUrl}/types`);
  }

  getPrimeRules(): Observable<PrimeRule[]> {
    return this.http.get<PrimeRule[]>(`${this.baseUrl}/rules`);
  }

  getPrimeResults(): Observable<PrimeResult[]> {
    return this.http.get<PrimeResult[]>(`${this.baseUrl}/results`);
  }

  getMyPrimeResults(employeeId: string): Observable<PrimeResult[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<PrimeResult[]>(`${this.baseUrl}/my-results`, { params });
  }

  updatePrimeResultStatus(id: string, req: UpdatePrimeResultStatusRequest): Observable<PrimeResult> {
    return this.http.put<PrimeResult>(`${this.baseUrl}/results/${id}/status`, req);
  }

  getDashboardStats(): Observable<PrimeDashboardStats> {
    return this.http.get<PrimeDashboardStats>(`${this.baseUrl}/dashboard-stats`);
  }
}

