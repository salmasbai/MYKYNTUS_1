import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  AuditLogDto,
  CreateDocumentRequestPayload,
  DocumentTemplateDetailDto,
  DbStatusDto,
  DirectoryUserDto,
  DocumentRequestDto,
  DocumentTemplateListItemDto,
  DocumentTypeDto,
  OrganizationalUnitSummaryDto,
  PagedResponse,
  TemplateVersionDto,
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

  getOrganisationPoles(): Observable<OrganizationalUnitSummaryDto[]> {
    return this.getWithOrgPathFallback<OrganizationalUnitSummaryDto[]>(
      'organisation/poles',
      'organization/poles',
    );
  }

  getCellulesByPole(poleId: string): Observable<OrganizationalUnitSummaryDto[]> {
    const params = new HttpParams().set('poleId', poleId);
    return this.getWithOrgPathFallback<OrganizationalUnitSummaryDto[]>(
      'organisation/cellules',
      'organization/cellules',
      params,
    );
  }

  getDepartementsByCellule(celluleId: string): Observable<OrganizationalUnitSummaryDto[]> {
    const params = new HttpParams().set('celluleId', celluleId);
    return this.getWithOrgPathFallback<OrganizationalUnitSummaryDto[]>(
      'organisation/departements',
      'organization/departements',
      params,
    );
  }

  /** Si la route FR retourne 404, tente l’alias US (même contrat backend). */
  private getWithOrgPathFallback<T>(pathFr: string, pathUs: string, params?: HttpParams): Observable<T> {
    const urlFr = `${this.dataRoot}/${pathFr}`;
    const urlUs = `${this.dataRoot}/${pathUs}`;
    const opts = params ? { params } : {};
    return this.http.get<T>(urlFr, opts).pipe(
      catchError((err: unknown) => {
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status === 404) {
          return this.http.get<T>(urlUs, opts);
        }
        return throwError(() => err);
      }),
    );
  }

  getUsersByRoleAndOrg(
    role: string,
    poleId: string,
    celluleId: string,
    departementId: string,
  ): Observable<DirectoryUserDto[]> {
    const params = new HttpParams()
      .set('role', role)
      .set('poleId', poleId)
      .set('celluleId', celluleId)
      .set('departementId', departementId);
    return this.http.get<DirectoryUserDto[]>(`${this.dataRoot}/users/by-role-org`, { params });
  }

  getManagersByDepartement(departementId: string): Observable<DirectoryUserDto[]> {
    const params = new HttpParams().set('departementId', departementId);
    return this.http.get<DirectoryUserDto[]>(`${this.dataRoot}/users/managers`, { params });
  }

  getCoachsByManager(managerId: string, departementId: string): Observable<DirectoryUserDto[]> {
    const params = new HttpParams().set('managerId', managerId).set('departementId', departementId);
    return this.http.get<DirectoryUserDto[]>(`${this.dataRoot}/users/coaches`, { params });
  }

  getPilotesByCoach(coachId: string, departementId: string): Observable<DirectoryUserDto[]> {
    const params = new HttpParams().set('coachId', coachId).set('departementId', departementId);
    return this.http.get<DirectoryUserDto[]>(`${this.dataRoot}/users/pilotes`, { params });
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
    const url = `${this.dataRoot}/document-requests`;
    console.log('SERVICE CALLED', 'DocumentationDataApiService.createDocumentRequest — HttpClient.post');
    console.log('[HTTP] POST', url, body);
    return this.http.post<DocumentRequestDto>(url, body);
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

  /** PUT REST — préféré (aligné contrat métier). */
  putValidateDocumentRequest(internalId: string, comment?: string | null): Observable<DocumentRequestDto> {
    const body = comment != null && String(comment).trim() !== '' ? { comment: String(comment).trim() } : {};
    return this.http.put<DocumentRequestDto>(
      `${this.dataRoot}/document-requests/${encodeURIComponent(internalId)}/validate`,
      body,
    );
  }

  putApproveDocumentRequest(internalId: string): Observable<DocumentRequestDto> {
    return this.http.put<DocumentRequestDto>(
      `${this.dataRoot}/document-requests/${encodeURIComponent(internalId)}/approve`,
      {},
    );
  }

  putRejectDocumentRequest(internalId: string, rejectionReason: string): Observable<DocumentRequestDto> {
    return this.http.put<DocumentRequestDto>(
      `${this.dataRoot}/document-requests/${encodeURIComponent(internalId)}/reject`,
      { rejectionReason },
    );
  }

  /** @deprecated Utiliser {@link putValidateDocumentRequest} — conservé pour compatibilité. */
  workflowValidate(body: { documentRequestId: string; comment?: string | null }): Observable<DocumentRequestDto> {
    return this.http.post<DocumentRequestDto>(`${this.dataRoot}/workflow/validate`, body);
  }

  /** @deprecated Utiliser {@link putApproveDocumentRequest}. */
  workflowApprove(body: { documentRequestId: string }): Observable<DocumentRequestDto> {
    return this.http.post<DocumentRequestDto>(`${this.dataRoot}/workflow/approve`, body);
  }

  /** @deprecated Utiliser {@link putRejectDocumentRequest}. */
  workflowReject(body: { documentRequestId: string; rejectionReason: string }): Observable<DocumentRequestDto> {
    return this.http.post<DocumentRequestDto>(`${this.dataRoot}/workflow/reject`, body);
  }

  getDocumentTemplates(): Observable<DocumentTemplateListItemDto[]> {
    return this.http.get<DocumentTemplateListItemDto[]>(`${this.dataRoot}/document-templates`);
  }

  getDocumentTemplate(templateId: string): Observable<DocumentTemplateDetailDto> {
    return this.http.get<DocumentTemplateDetailDto>(`${this.dataRoot}/document-templates/${encodeURIComponent(templateId)}`);
  }

  createTemplateFromUpload(body: {
    code: string;
    name: string;
    documentTypeId?: string | null;
    fileName: string;
    content: string;
  }): Observable<DocumentTemplateDetailDto> {
    return this.http.post<DocumentTemplateDetailDto>(`${this.dataRoot}/document-templates/upload`, body);
  }

  createTemplateRuleBased(body: {
    code: string;
    name: string;
    documentTypeId?: string | null;
    description: string;
    suggestedVariables?: string[];
  }): Observable<DocumentTemplateDetailDto> {
    return this.http.post<DocumentTemplateDetailDto>(`${this.dataRoot}/document-templates/rule-generate`, body);
  }

  updateTemplate(templateId: string, body: { name: string; documentTypeId?: string | null }): Observable<DocumentTemplateDetailDto> {
    return this.http.put<DocumentTemplateDetailDto>(
      `${this.dataRoot}/document-templates/${encodeURIComponent(templateId)}`,
      body,
    );
  }

  setTemplateStatus(templateId: string, isActive: boolean): Observable<DocumentTemplateDetailDto> {
    return this.http.patch<DocumentTemplateDetailDto>(
      `${this.dataRoot}/document-templates/${encodeURIComponent(templateId)}/status`,
      { isActive },
    );
  }

  createTemplateVersion(
    templateId: string,
    body: {
      structuredContent: string;
      status?: 'draft' | 'published' | 'archived' | string;
      originalAssetUri?: string | null;
      variables?: Array<{
        name: string;
        type: 'text' | 'date' | 'number' | string;
        isRequired: boolean;
        defaultValue?: string | null;
        validationRule?: string | null;
      }>;
    },
  ): Observable<TemplateVersionDto> {
    return this.http.post<TemplateVersionDto>(
      `${this.dataRoot}/document-templates/${encodeURIComponent(templateId)}/versions`,
      body,
    );
  }

  getTemplateVersions(templateId: string): Observable<TemplateVersionDto[]> {
    return this.http.get<TemplateVersionDto[]>(`${this.dataRoot}/document-templates/${encodeURIComponent(templateId)}/versions`);
  }

  testRunTemplate(
    templateId: string,
    sampleData: Record<string, string>,
  ): Observable<{ renderedContent: string; missingVariables: string[]; previewFileName: string }> {
    return this.http.post<{ renderedContent: string; missingVariables: string[]; previewFileName: string }>(
      `${this.dataRoot}/document-templates/${encodeURIComponent(templateId)}/test-run`,
      { sampleData },
    );
  }

  generateFromDocumentTemplate(
    templateId: string,
    body: { documentRequestId?: string | null; documentTypeId?: string | null; variables?: Record<string, string> } = {},
  ): Observable<{ generatedDocumentId: string; fileName: string; storageUri: string; status: string }> {
    return this.http.post<{ generatedDocumentId: string; fileName: string; storageUri: string; status: string }>(
      `${this.dataRoot}/document-templates/${encodeURIComponent(templateId)}/generate`,
      body,
    );
  }
}
