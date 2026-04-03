import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import type { DocumentationRole } from '../../interfaces/documentation-role';
import { DocumentationNavigationService } from '../../services/documentation-navigation.service';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AuditJournalPageComponent } from '../audit-journal-page/audit-journal-page.component';
import { ManagerDashboardComponent } from '../manager-dashboard/manager-dashboard.component';
import { PiloteDashboardComponent } from '../pilote-dashboard/pilote-dashboard.component';
import { RhDashboardComponent } from '../rh-dashboard/rh-dashboard.component';
import { RpDashboardComponent } from '../rp-dashboard/rp-dashboard.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    PiloteDashboardComponent,
    ManagerDashboardComponent,
    RhDashboardComponent,
    RpDashboardComponent,
    AdminDashboardComponent,
    AuditJournalPageComponent,
  ],
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent {
  readonly role$ = this.nav.role$;

  constructor(private readonly nav: DocumentationNavigationService) {}

  displayRole(role: DocumentationRole | null): role is DocumentationRole {
    return role !== null && role !== undefined;
  }
}
