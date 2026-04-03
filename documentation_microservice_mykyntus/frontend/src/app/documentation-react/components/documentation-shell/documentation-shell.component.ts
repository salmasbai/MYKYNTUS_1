import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import { DocumentationIdentityService } from '../../../core/services/documentation-identity.service';
import { mapApiRoleToDocumentationRole } from '../../lib/map-api-documentation-role';
import { AppContextService } from '../../services/app-context.service';
import { DocumentationNavigationService } from '../../services/documentation-navigation.service';
import { DocumentationHeaderComponent } from '../documentation-header/documentation-header.component';
import { DocumentationSidebarComponent } from '../documentation-sidebar/documentation-sidebar.component';

@Component({
  selector: 'app-documentation-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DocumentationSidebarComponent, DocumentationHeaderComponent],
  templateUrl: './documentation-shell.component.html',
})
export class DocumentationShellComponent implements OnInit {
  readonly title$ = this.nav.activeTab$.pipe(
    map((tab) => this.nav.titleForActiveTab(tab, (k) => this.app.t(k))),
  );

  constructor(
    readonly nav: DocumentationNavigationService,
    private readonly app: AppContextService,
    private readonly data: DocumentationDataApiService,
    private readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.data.getDirectoryUsers().subscribe({
      next: (list) => this.identity.setDirectoryUsers(list),
      error: () => this.identity.setDirectoryUsers([]),
    });
    this.data
      .getDirectoryUserMe()
      .pipe(catchError(() => of(null)))
      .subscribe((me) => {
        if (me) {
          this.identity.applyProfile(me);
          this.nav.syncRoleFromIdentity(mapApiRoleToDocumentationRole(me.role));
          this.identity.bumpContextRevision();
        }
      });
  }
}
