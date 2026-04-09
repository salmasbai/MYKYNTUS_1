import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DocumentationDataApiService } from '../../core/services/documentation-data-api.service';
import type { DocumentTemplateListItemDto } from '../../shared/models/api.models';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';

@Component({
  standalone: true,
  selector: 'app-templates-page',
  imports: [CommonModule, DocIconComponent],
  templateUrl: './templates-page.component.html',
})
export class TemplatesPageComponent implements OnInit, OnDestroy {
  templates: DocumentTemplateListItemDto[] = [];
  loading = true;
  error: string | null = null;
  generatingId: string | null = null;
  lastMessage: string | null = null;
  private sub = new Subscription();

  constructor(private readonly data: DocumentationDataApiService) {}

  ngOnInit(): void {
    this.sub.add(
      this.data.getDocumentTemplates().subscribe({
        next: (rows) => {
          this.templates = rows;
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.templates = [];
          this.loading = false;
          this.error = 'Impossible de charger les modèles (API /api/documentation/data/document-templates).';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  generate(t: DocumentTemplateListItemDto): void {
    this.generatingId = t.id;
    this.lastMessage = null;
    this.sub.add(
      this.data.generateFromDocumentTemplate(t.id, { documentTypeId: t.documentTypeId }).subscribe({
        next: (res) => {
          this.generatingId = null;
          this.lastMessage = `Généré : ${res.fileName} — ${res.storageUri}`;
        },
        error: () => {
          this.generatingId = null;
          this.lastMessage = 'Échec de la génération (vérifiez les en-têtes et la session).';
        },
      }),
    );
  }
}
