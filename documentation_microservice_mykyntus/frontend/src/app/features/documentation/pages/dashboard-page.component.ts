import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import { DocumentationNotificationService } from '../../../core/services/documentation-notification.service';
import type { DbStatusDto, DocumentRequestDto } from '../../../shared/models/api.models';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
})
export class DashboardPageComponent implements OnInit {
  status: DbStatusDto | null = null;
  requests: DocumentRequestDto[] = [];
  totalRequestCount = 0;
  loading = true;
  error: string | null = null;

  constructor(
    private readonly api: DocumentationDataApiService,
    private readonly notify: DocumentationNotificationService,
  ) {}

  ngOnInit(): void {
    this.api.getDbStatus().subscribe({
      next: (s) => {
        this.status = s;
      },
      error: () => {
        this.status = { connected: false, errorMessage: 'Impossible de joindre /db/status.' };
      },
    });

    this.api.getDocumentRequests(1, 8, {}).subscribe({
      next: (p) => {
        this.requests = p.items;
        this.totalRequestCount = p.totalCount;
        this.loading = false;
      },
      error: (e: unknown) => {
        const msg =
          e instanceof HttpErrorResponse && e.error && typeof e.error === 'object' && 'message' in e.error
            ? String((e.error as { message?: string }).message)
            : 'Erreur chargement des demandes.';
        this.error = msg;
        this.notify.showError(msg);
        this.loading = false;
      },
    });
  }
}
