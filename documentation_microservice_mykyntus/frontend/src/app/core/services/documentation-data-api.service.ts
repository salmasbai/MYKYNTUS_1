import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  AuditLogDto,
  CreateDocumentRequestPayload,
  DbStatusDto,
  DirectoryUserDto,
  DocumentRequestDto,
  DocumentTypeDto,
  PagedResponse,
} from '../../shared/models/api.models';

export interface DocumentRequestsQuery {
  status?: string;
  type?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogsQuery {
  action?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Point d’accès unique au contrat REST du microservice Documentation (données réelles).
 * L’identité est portée par les en-têtes (injectés par la gateway ou l’intercepteur de développement).
 */
@Injectable({ providedIn: 'root' })
export class DocumentationDataApiService {
  private readonly dataRoot = `${environment.apiBaseUrl}/api/documentation/data`;

  constructor(private readonly http: HttpClient) {}

  getDbStatus(): Observable<DbStatusDto> {
    return this.http.get<DbStatusDto>(`${environment.apiBaseUrl}/api/documentation/db/status`);
  }

  getDocumentTypes(): Observable<DocumentTypeDto[]> {
    return this.http.get<DocumentTypeDto[]>(`${this.dataRoot}/document-types`);
  }

  getDirectoryUsers(): Observable<DirectoryUserDto[]> {
    return this.http.get<DirectoryUserDto[]>(`${this.dataRoot}/users`);
  }

  getDirectoryUserMe(): Observable<DirectoryUserDto> {
    return this.http.get<DirectoryUserDto>(`${this.dataRoot}/users/me`);
  }

  getDirectoryUser(id: string): Observable<DirectoryUserDto> {
    return this.http.get<DirectoryUserDto>(`${this.dataRoot}/users/${encodeURIComponent(id)}`);
  }

  getDocumentRequests(
    page = 1,
    pageSize = 20,
    query: DocumentRequestsQuery = {},
  ): Observable<PagedResponse<DocumentRequestDto>> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.type) {
      params = params.set('type', query.type);
    }
    if (query.role) {
      params = params.set('role', query.role);
    }
    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.set('sortOrder', query.sortOrder);
    }
    return this.http.get<PagedResponse<DocumentRequestDto>>(`${this.dataRoot}/document-requests`, { params });
  }

  getDocumentRequest(internalId: string): Observable<DocumentRequestDto> {
    return this.http.get<DocumentRequestDto>(`${this.dataRoot}/document-requests/${internalId}`);
  }

  createDocumentRequest(body: CreateDocumentRequestPayload): Observable<DocumentRequestDto> {
    return this.http.post<DocumentRequestDto>(`${this.dataRoot}/document-requests`, body);
  }

  getAuditLogs(page = 1, pageSize = 50, query: AuditLogsQuery = {}): Observable<PagedResponse<AuditLogDto>> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    if (query.action) {
      params = params.set('action', query.action);
    }
    if (query.role) {
      params = params.set('role', query.role);
    }
    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.set('sortOrder', query.sortOrder);
    }
    return this.http.get<PagedResponse<AuditLogDto>>(`${this.dataRoot}/audit-logs`, { params });
  }

  workflowValidate(body: { documentRequestId: string; comment?: string | null }): Observable<DocumentRequestDto> {
    return this.http.post<DocumentRequestDto>(`${this.dataRoot}/workflow/validate`, body);
  }

  workflowApprove(body: { documentRequestId: string }): Observable<DocumentRequestDto> {
    return this.http.post<DocumentRequestDto>(`${this.dataRoot}/workflow/approve`, body);
  }

  workflowReject(body: { documentRequestId: string; rejectionReason: string }): Observable<DocumentRequestDto> {
    return this.http.post<DocumentRequestDto>(`${this.dataRoot}/workflow/reject`, body);
  }
}
