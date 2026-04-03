import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import type { DocumentationTemplate } from '../interfaces/documentation-entities';
import { mapDocumentTypeDtoToTemplate } from '../lib/documentation-dto-mappers';
import { DocumentationApiService } from '../services/documentation-api.service';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';

@Component({
  standalone: true,
  selector: 'app-templates-page',
  imports: [CommonModule, DocIconComponent],
  templateUrl: './templates-page.component.html',
})
export class TemplatesPageComponent implements OnInit, OnDestroy {
  templates: DocumentationTemplate[] = [];
  loading = true;
  error: string | null = null;
  private sub = new Subscription();

  constructor(private readonly api: DocumentationApiService) {}

  ngOnInit(): void {
    this.sub.add(
      this.api.getDocTypesForCatalog().subscribe({
        next: (rows) => {
          this.templates = rows.map(mapDocumentTypeDtoToTemplate);
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.templates = [];
          this.loading = false;
          this.error = 'Impossible de charger les types de documents.';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
