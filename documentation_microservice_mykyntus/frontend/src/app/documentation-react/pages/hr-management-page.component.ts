import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';
import type { DocumentationRole } from '../interfaces/documentation-role';
import { switchMapOnDocumentationContext } from '../lib/documentation-context-refresh';
import type { DocumentationRequest } from '../interfaces/documentation-entities';
import { mapDocumentRequestDto } from '../lib/documentation-dto-mappers';
import { DocumentationApiService } from '../services/documentation-api.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';
import { StatusBadgeComponent } from '../components/status-badge/status-badge.component';

@Component({
  standalone: true,
  selector: 'app-hr-management-page',
  imports: [CommonModule, DocIconComponent, StatusBadgeComponent],
  templateUrl: './hr-management-page.component.html',
})
export class HrManagementPageComponent implements OnInit, OnDestroy {
  readonly role$ = this.nav.role$;

  requests: DocumentationRequest[] = [];
  loading = true;
  error: string | null = null;
  private sub = new Subscription();

  constructor(
    private readonly nav: DocumentationNavigationService,
    private readonly api: DocumentationApiService,
    private readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.sub.add(
      switchMapOnDocumentationContext(this.identity, () => this.api.getAllDocumentRequests()).subscribe({
        next: (rows) => {
          this.requests = rows.map(mapDocumentRequestDto);
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.requests = [];
          this.loading = false;
          this.error = 'Impossible de charger les demandes.';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0] ?? '')
      .join('')
      .slice(0, 3)
      .toUpperCase();
  }

  canApproveReject(role: DocumentationRole): boolean {
    return role === 'RH';
  }

  canGenerate(role: DocumentationRole): boolean {
    return role === 'RH' || role === 'Admin';
  }

  countStatus(status: DocumentationRequest['status']): number {
    return this.requests.filter((r) => r.status === status).length;
  }
}
