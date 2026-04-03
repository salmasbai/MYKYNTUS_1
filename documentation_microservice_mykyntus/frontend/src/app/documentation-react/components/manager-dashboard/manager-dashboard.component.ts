import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DocumentationIdentityService } from '../../../core/services/documentation-identity.service';
import type { DocumentationRole } from '../../interfaces/documentation-role';
import { switchMapOnDocumentationContext } from '../../lib/documentation-context-refresh';
import type { DocumentationDocument, DocumentationRequest } from '../../interfaces/documentation-entities';
import { filterByEmployeeScope } from '../../lib/documentation-filters';
import { mapDocumentRequestDto, mapRequestToGeneratedDocument } from '../../lib/documentation-dto-mappers';
import type { HierarchyDrillSelection } from '../../lib/documentation-org-hierarchy';
import { DocumentationApiService } from '../../services/documentation-api.service';
import { DocumentationHierarchyDrillService } from '../../services/documentation-hierarchy-drill.service';
import { DocumentationNavigationService } from '../../services/documentation-navigation.service';
import { DocDrillBarComponent } from '../doc-drill-bar/doc-drill-bar.component';
import { DocIconComponent } from '../doc-icon/doc-icon.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, DocIconComponent, StatusBadgeComponent, DocDrillBarComponent],
  templateUrl: './manager-dashboard.component.html',
})
export class ManagerDashboardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) role!: DocumentationRole;

  drill: HierarchyDrillSelection = {};
  private sub = new Subscription();

  loading = true;
  error: string | null = null;
  private allRequests: DocumentationRequest[] = [];

  constructor(
    private readonly hierarchy: DocumentationHierarchyDrillService,
    private readonly nav: DocumentationNavigationService,
    private readonly api: DocumentationApiService,
    private readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.sub.add(this.hierarchy.drill$.subscribe((d) => (this.drill = d)));
    this.sub.add(
      switchMapOnDocumentationContext(this.identity, () => this.api.getAllDocumentRequests()).subscribe({
        next: (rows) => {
          this.allRequests = rows.map(mapDocumentRequestDto);
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.allRequests = [];
          this.loading = false;
          this.error = 'Impossible de charger les demandes.';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get teamRequests(): DocumentationRequest[] {
    return filterByEmployeeScope(
      this.allRequests,
      this.role,
      this.role === 'Manager' ? this.drill : undefined,
    );
  }

  get teamDocs(): DocumentationDocument[] {
    return this.teamRequests
      .map((r) => mapRequestToGeneratedDocument(r))
      .filter((d): d is DocumentationDocument => d !== null);
  }

  get memberCount(): number {
    return new Set(
      [...this.teamRequests.map((r) => r.employeeId), ...this.teamDocs.map((d) => d.employeeId)].filter(Boolean),
    ).size;
  }

  readonly statsDef = [
    { key: 'req', label: 'Demandes équipe', icon: 'users', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'pend', label: 'En attente de validation', icon: 'clock', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { key: 'gen', label: 'Documents générés (équipe)', icon: 'check-circle-2', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'mem', label: 'Membres de l’équipe', icon: 'user', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  statValue(key: string): number {
    switch (key) {
      case 'req':
        return this.teamRequests.length;
      case 'pend':
        return this.teamRequests.filter((r) => r.status === 'Pending').length;
      case 'gen':
        return this.teamDocs.length;
      case 'mem':
        return this.memberCount;
      default:
        return 0;
    }
  }

  goTeamDocs(): void {
    this.nav.navigateToTab('team-docs');
  }

  goTeamRequests(): void {
    this.nav.navigateToTab('team-requests');
  }

  previewRequests(): DocumentationRequest[] {
    return this.teamRequests.slice(0, 4);
  }
}
