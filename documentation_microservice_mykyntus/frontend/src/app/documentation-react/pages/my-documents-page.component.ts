import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';
import type { DocumentationDocument } from '../interfaces/documentation-entities';
import { switchMapOnDocumentationContext } from '../lib/documentation-context-refresh';
import { filterByEmployeeScope } from '../lib/documentation-filters';
import { mapDocumentRequestDto, mapRequestToGeneratedDocument } from '../lib/documentation-dto-mappers';
import { DocumentationApiService } from '../services/documentation-api.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';
import { StatusBadgeComponent } from '../components/status-badge/status-badge.component';

@Component({
  standalone: true,
  selector: 'app-my-documents-page',
  imports: [CommonModule, FormsModule, DocIconComponent, StatusBadgeComponent],
  templateUrl: './my-documents-page.component.html',
})
export class MyDocumentsPageComponent implements OnInit, OnDestroy {
  search = '';
  readonly role$ = this.nav.role$;

  private documents: DocumentationDocument[] = [];
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
          const ui = rows.map(mapDocumentRequestDto);
          this.documents = ui
            .map((r) => mapRequestToGeneratedDocument(r))
            .filter((d): d is DocumentationDocument => d !== null);
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.documents = [];
          this.loading = false;
          this.error = 'Impossible de charger les documents.';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  filtered(role: import('../interfaces/documentation-role').DocumentationRole) {
    const scoped = filterByEmployeeScope(this.documents, role);
    const q = this.search.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter(
      (doc) => doc.name.toLowerCase().includes(q) || doc.type.toLowerCase().includes(q),
    );
  }
}
