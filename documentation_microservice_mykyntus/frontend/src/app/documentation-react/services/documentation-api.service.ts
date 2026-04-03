import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { expand, reduce } from 'rxjs/operators';

import { DocumentationDataApiService } from '../../core/services/documentation-data-api.service';
import type {
  AuditLogDto,
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
