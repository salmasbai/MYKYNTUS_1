import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import type { DocumentationRole } from '../interfaces/documentation-role';
import { AdminShellComponent } from '../components/admin-shell/admin-shell.component';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';

@Component({
  standalone: true,
  selector: 'app-admin-workflow-page',
  imports: [CommonModule, AdminShellComponent],
  templateUrl: './admin-workflow-page.component.html',
})
export class AdminWorkflowPageComponent {
  readonly role$ = this.nav.role$;

  constructor(private readonly nav: DocumentationNavigationService) {}

  isAdmin(role: DocumentationRole): boolean {
    return role === 'Admin';
  }
}
