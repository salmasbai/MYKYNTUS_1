import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DocumentationHeaders } from '../constants/documentation-headers';
import { DocumentationIdentityService } from '../services/documentation-identity.service';

const DataApiSegment = '/api/documentation/data';

function newCorrelationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Ajoute les en-têtes de contexte utilisateur attendus par le backend.
 * En production, la gateway les pose en amont — cet intercepteur ne fusionne pas l’identité locale (évite tout mélange avec le mode dev).
 */
@Injectable()
export class DocumentationUserContextInterceptor implements HttpInterceptor {
  constructor(private readonly identity: DocumentationIdentityService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.includes(DataApiSegment)) {
      return next.handle(req);
    }

    let headers = req.headers;
    if (!headers.has(DocumentationHeaders.correlationId)) {
      headers = headers.set(DocumentationHeaders.correlationId, newCorrelationId());
    }

    if (!environment.production) {
      const fromIdentity = this.identity.getHeaderMap();
      for (const [key, value] of Object.entries(fromIdentity)) {
        if (value) {
          headers = headers.set(key, value);
        }
      }
    }

    return next.handle(req.clone({ headers }));
  }
}
