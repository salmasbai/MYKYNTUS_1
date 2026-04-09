import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { expand, reduce } from 'rxjs/operators';

import { DocumentationDataApiService } from '../../core/services/documentation-data-api.service';
import type {
  AuditLogDto,
  CreateDocumentRequestPayload,
  DocumentRequestDto,
  DocumentTypeDto,
  PagedResponse,
} from '../../shared/models/api.models';
import type { AuditLogsQuery, DocumentRequestsQuery } from '../../core/services/documentation-data-api.service';

/**
 * Façade alignée sur la démo React (noms de méthodes) — délègue au client REST existant.
 */
@Injectable({ providedIn: 'root' })
export class DocumentationApiService {
  constructor(private readonly data: DocumentationDataApiService) {}

  getDocTypesForCatalog(): Observable<DocumentTypeDto[]> {
    return this.data.getDocumentTypes();
  }

  createDocumentRequest(body: CreateDocumentRequestPayload): Observable<DocumentRequestDto> {
    console.log('SERVICE CALLED', 'DocumentationApiService.createDocumentRequest');
    return this.data.createDocumentRequest(body);
  }

  /**
   * Utilise POST /workflow/* (toujours présent sur le backend) — évite le 404 si les routes PUT
   * `document-requests/{id}/approve` ne sont pas déployées.
   */
  validateDocumentRequest(internalId: string, comment?: string | null): Observable<DocumentRequestDto> {
    return this.data.workflowValidate({ documentRequestId: internalId, comment });
  }

  approveDocumentRequest(internalId: string): Observable<DocumentRequestDto> {
    return this.data.workflowApprove({ documentRequestId: internalId });
  }

  rejectDocumentRequest(internalId: string, rejectionReason: string): Observable<DocumentRequestDto> {
    return this.data.workflowReject({ documentRequestId: internalId, rejectionReason });
  }

  getDataDocumentRequests(
    page = 1,
    pageSize = 20,
    query: DocumentRequestsQuery = {},
  ): Observable<PagedResponse<DocumentRequestDto>> {
    return this.data.getDocumentRequests(page, pageSize, query);
  }

  getDataAuditLogs(
    page = 1,
    pageSize = 50,
    query: AuditLogsQuery = {},
  ): Observable<PagedResponse<AuditLogDto>> {
    return this.data.getAuditLogs(page, pageSize, query);
  }

  /** Toutes les pages — pour tableaux de bord et agrégations (limite par page : 100). */
  getAllDocumentRequests(query: DocumentRequestsQuery = {}): Observable<DocumentRequestDto[]> {
    return this.getDataDocumentRequests(1, 100, query).pipe(
      expand((res) => {
        if (res.page * res.pageSize >= res.totalCount) return EMPTY;
        return this.getDataDocumentRequests(res.page + 1, res.pageSize, query);
      }),
      reduce((acc, res) => acc.concat(res.items), [] as DocumentRequestDto[]),
    );
  }

  getAllAuditLogs(query: AuditLogsQuery = {}): Observable<AuditLogDto[]> {
    return this.getDataAuditLogs(1, 100, query).pipe(
      expand((res) => {
        if (res.page * res.pageSize >= res.totalCount) return EMPTY;
        return this.getDataAuditLogs(res.page + 1, res.pageSize, query);
      }),
      reduce((acc, res) => acc.concat(res.items), [] as AuditLogDto[]),
    );
  }
}
