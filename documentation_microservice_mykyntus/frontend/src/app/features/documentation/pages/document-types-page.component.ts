import { Component, OnInit } from '@angular/core';

import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import type { DocumentTypeDto } from '../../../shared/models/api.models';

@Component({
  selector: 'app-document-types-page',
  templateUrl: './document-types-page.component.html',
  styleUrls: ['./document-types-page.component.css'],
})
export class DocumentTypesPageComponent implements OnInit {
  types: DocumentTypeDto[] = [];
  loading = true;
  error: string | null = null;

  constructor(private readonly api: DocumentationDataApiService) {}

  ngOnInit(): void {
    this.api.getDocumentTypes().subscribe({
      next: (t) => {
        this.types = t;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les types.';
        this.loading = false;
      },
    });
  }
}
