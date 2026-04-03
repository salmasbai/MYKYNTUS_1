import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import { DocumentationNotificationService } from '../../../core/services/documentation-notification.service';
import type { DocumentRequestDto } from '../../../shared/models/api.models';

@Component({
  selector: 'app-request-detail-page',
  templateUrl: './request-detail-page.component.html',
  styleUrls: ['./request-detail-page.component.css'],
})
export class RequestDetailPageComponent implements OnInit {
  request: DocumentRequestDto | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: DocumentationDataApiService,
    private readonly notify: DocumentationNotificationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.error = 'Identifiant manquant.';
            this.loading = false;
            return EMPTY;
          }
          return this.api.getDocumentRequest(id);
        }),
      )
      .subscribe({
        next: (r) => {
          this.request = r;
          this.loading = false;
        },
        error: (e: unknown) => {
          const msg = this.formatError(e);
          this.error = msg;
          this.notify.showError(msg);
          this.loading = false;
        },
      });
  }

  onRequestUpdated(next: DocumentRequestDto): void {
    this.request = next;
  }

  private formatError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const body = e.error;
      if (body && typeof body === 'object' && 'message' in body) {
        return String((body as { message?: string }).message);
      }
      if (e.status === 404) {
        return 'Demande introuvable.';
      }
      return e.message || 'Erreur serveur.';
    }
    return 'Erreur réseau ou serveur.';
  }
}
