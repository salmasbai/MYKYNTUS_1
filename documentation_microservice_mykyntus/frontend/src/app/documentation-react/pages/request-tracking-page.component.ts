import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';
import type { DocumentationRequest } from '../interfaces/documentation-entities';
import { switchMapOnDocumentationContext } from '../lib/documentation-context-refresh';
import { filterByEmployeeScope } from '../lib/documentation-filters';
import { mapDocumentRequestDto } from '../lib/documentation-dto-mappers';
import { DocumentationApiService } from '../services/documentation-api.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';
import { StatusBadgeComponent } from '../components/status-badge/status-badge.component';

@Component({
  standalone: true,
  selector: 'app-request-tracking-page',
  imports: [CommonModule, DocIconComponent, StatusBadgeComponent],
  templateUrl: './request-tracking-page.component.html',
})
export class RequestTrackingPageComponent implements OnInit, OnDestroy {
  readonly role$ = this.nav.role$;
  private all: DocumentationRequest[] = [];
  loading = true;
  error: string | null = null;
  private sub = new Subscription();

  constructor(
    private readonly api: DocumentationApiService,
    private readonly nav: DocumentationNavigationService,
    private readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.sub.add(
      switchMapOnDocumentationContext(this.identity, () => this.api.getAllDocumentRequests()).subscribe({
        next: (rows) => {
          this.all = rows.map(mapDocumentRequestDto);
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.all = [];
          this.loading = false;
          this.error = 'Impossible de charger le suivi des demandes.';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  requestsForRole(role: import('../interfaces/documentation-role').DocumentationRole): DocumentationRequest[] {
    return filterByEmployeeScope(this.all, role);
  }
}
