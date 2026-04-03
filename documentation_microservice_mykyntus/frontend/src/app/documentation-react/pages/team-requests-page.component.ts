import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';
import type { DocumentationRole } from '../interfaces/documentation-role';
import { switchMapOnDocumentationContext } from '../lib/documentation-context-refresh';
import type { DocumentationRequest } from '../interfaces/documentation-entities';
import { filterByEmployeeScope } from '../lib/documentation-filters';
import { mapDocumentRequestDto } from '../lib/documentation-dto-mappers';
import type { HierarchyDrillSelection } from '../lib/documentation-org-hierarchy';
import { DocumentationApiService } from '../services/documentation-api.service';
import { DocumentationHierarchyDrillService } from '../services/documentation-hierarchy-drill.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';
import { DocDrillBarComponent } from '../components/doc-drill-bar/doc-drill-bar.component';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';
import { StatusBadgeComponent } from '../components/status-badge/status-badge.component';

@Component({
  standalone: true,
  selector: 'app-team-requests-page',
  imports: [CommonModule, DocDrillBarComponent, DocIconComponent, StatusBadgeComponent],
  templateUrl: './team-requests-page.component.html',
})
export class TeamRequestsPageComponent implements OnInit, OnDestroy {
  readonly role$ = this.nav.role$;
  drill: HierarchyDrillSelection = {};
  private sub = new Subscription();

  private all: DocumentationRequest[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private readonly nav: DocumentationNavigationService,
    private readonly hierarchy: DocumentationHierarchyDrillService,
    private readonly api: DocumentationApiService,
    private readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.sub.add(this.hierarchy.drill$.subscribe((d) => (this.drill = d)));
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
          this.error = 'Impossible de charger les demandes.';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  teamReqs(role: DocumentationRole): DocumentationRequest[] {
    return filterByEmployeeScope(
      this.all,
      role,
      role === 'Manager' || role === 'RP' ? this.drill : undefined,
    );
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }
}
