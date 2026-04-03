import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import { DocumentationNotificationService } from '../../../core/services/documentation-notification.service';
import type { DocumentRequestDto, DocumentTypeDto } from '../../../shared/models/api.models';

@Component({
  selector: 'app-create-request-page',
  templateUrl: './create-request-page.component.html',
  styleUrls: ['./create-request-page.component.css'],
})
export class CreateRequestPageComponent implements OnInit {
  modes: 'catalog' | 'other' = 'catalog';
  types: DocumentTypeDto[] = [];
  selectedTypeId = '';
  customDescription = '';
  reason = '';
  comments = '';

  typesLoading = true;
  submitting = false;
  error: string | null = null;
  created: DocumentRequestDto | null = null;

  constructor(
    private readonly api: DocumentationDataApiService,
    private readonly notify: DocumentationNotificationService,
  ) {}

  ngOnInit(): void {
    this.typesLoading = true;
    this.api.getDocumentTypes().subscribe({
      next: (t) => {
        this.types = t;
        if (t.length && !this.selectedTypeId) {
          this.selectedTypeId = t[0].id;
        }
      },
      error: () => {
        const msg = 'Impossible de charger le catalogue.';
        this.error = msg;
        this.notify.showError(msg);
      },
      complete: () => {
        this.typesLoading = false;
      },
    });
  }

  submit(): void {
    this.error = null;
    this.created = null;
    if (this.modes === 'catalog' && !this.selectedTypeId) {
      this.error = 'Choisissez un type de document.';
      return;
    }
    if (this.modes === 'other' && !this.customDescription.trim()) {
      this.error = 'La description du type « Autre » est obligatoire.';
      return;
    }

    this.submitting = true;
    this.api
      .createDocumentRequest({
        isCustomType: this.modes === 'other',
        documentTypeId: this.modes === 'catalog' ? this.selectedTypeId : null,
        customTypeDescription: this.modes === 'other' ? this.customDescription.trim() : null,
        reason: this.reason.trim() || null,
        complementaryComments: this.comments.trim() || null,
      })
      .subscribe({
        next: (r) => {
          this.submitting = false;
          this.created = r;
          this.notify.showSuccess('Demande créée avec succès.');
        },
        error: (e: unknown) => {
          this.submitting = false;
          const msg = this.formatErr(e);
          this.error = msg;
          this.notify.showError(msg);
        },
      });
  }

  private formatErr(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const err = e.error;
      if (err && typeof err === 'object') {
        const o = err as { message?: string; detail?: string };
        return o.message ?? o.detail ?? 'Création refusée.';
      }
      return e.message || 'Création refusée.';
    }
    return 'Erreur réseau ou serveur.';
  }
}
