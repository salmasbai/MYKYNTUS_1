import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { DocumentationNotificationService } from '../services/documentation-notification.service';

const DataApiSegment = '/api/documentation/data';

/**
 * Messages utilisateur pour les erreurs HTTP du microservice Documentation (sans altérer le corps des erreurs).
 */
@Injectable()
export class DocumentationHttpErrorsInterceptor implements HttpInterceptor {
  constructor(private readonly notify: DocumentationNotificationService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap({
        error: (err: unknown) => {
          if (!(err instanceof HttpErrorResponse)) {
            return;
          }
          if (!req.url.includes(DataApiSegment)) {
            return;
          }
          const body = err.error;
          if (err.status === 401) {
            let msg =
              'Accès refusé : contexte utilisateur incomplet. La passerelle doit fournir les en-têtes d’identité (utilisateur et rôle) pour appeler ce service.';
            if (body && typeof body === 'object' && 'message' in body) {
              const m = (body as { message?: unknown }).message;
              if (typeof m === 'string' && m.trim()) {
                msg = m;
              }
            }
            this.notify.showError(msg);
          }
        },
      }),
    );
  }
}
