import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import type { CreateDocumentRequestPayload, DocumentTypeDto } from '../../shared/models/api.models';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';
import { DocumentationApiService } from '../services/documentation-api.service';
import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';

/** Valeur sentinelle pour « Autre » (distincte des UUID du catalogue). */
const OTHER_KEY = '__autre__';

@Component({
  standalone: true,
  selector: 'app-request-document-page',
  imports: [CommonModule, FormsModule, DocIconComponent],
  templateUrl: './request-document-page.component.html',
})
export class RequestDocumentPageComponent implements OnInit {
  readonly OTHER_KEY = OTHER_KEY;
  readonly otherLabel = 'Autre';

  docTypes: DocumentTypeDto[] = [];
  docTypesLoading = false;
  docTypesError: string | null = null;

  /** ID catalogue ou <see cref="OTHER_KEY" />. */
  documentTypeKey = '';
  otherDescription = '';
  otherDescriptionError = false;

  reason = '';
  complementaryComments = '';

  submitting = false;
  submitError: string | null = null;
  submitSuccess = false;
  /** Numéro métier affiché côté API (<code>id</code> du DTO = REQ-YYYY-… ou repli UUID). */
  submitSuccessRef: string | null = null;
  /** Clé primaire en base (<code>internalId</code> du DTO = colonne <code>id</code>). */
  submitSuccessInternalId: string | null = null;
  submitSuccessTenant: string | null = null;

  constructor(
    private readonly api: DocumentationApiService,
    private readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.docTypesLoading = true;
    this.docTypesError = null;
    this.api.getDocTypesForCatalog().subscribe({
      next: (types) => {
        this.docTypes = (types ?? []).filter((t) => t?.id);
        this.docTypesLoading = false;
        if (this.docTypes.length > 0) {
          this.documentTypeKey = this.docTypes[0]!.id;
        } else {
          this.documentTypeKey = OTHER_KEY;
        }
      },
      error: (err: unknown) => {
        this.docTypesLoading = false;
        this.docTypesError = this.formatHttpError(err);
        this.documentTypeKey = OTHER_KEY;
      },
    });
  }

  handleSubmit(ev: Event): void {
    console.log('CLICK DETECTED');
    ev.preventDefault();
    this.submitError = null;
    this.submitSuccess = false;
    this.submitSuccessRef = null;
    this.submitSuccessInternalId = null;
    this.submitSuccessTenant = null;

    if (this.docTypesLoading || this.submitting) {
      console.log('[handleSubmit] sortie anticipée : chargement types ou envoi déjà en cours', {
        docTypesLoading: this.docTypesLoading,
        submitting: this.submitting,
      });
      return;
    }

    const isCustom = this.documentTypeKey === OTHER_KEY;
    if (isCustom) {
      const trimmed = this.otherDescription.trim();
      if (!trimmed) {
        this.otherDescriptionError = true;
        console.log('[handleSubmit] sortie anticipée : type « Autre » sans description');
        return;
      }
      this.otherDescriptionError = false;
    }

    const payload: CreateDocumentRequestPayload = {
      isCustomType: isCustom,
      documentTypeId: isCustom ? null : this.documentTypeKey,
      customTypeDescription: isCustom ? this.otherDescription.trim() : null,
      reason: this.reason.trim() || null,
      complementaryComments: this.complementaryComments.trim() || null,
    };

    this.submitting = true;
    console.log('[handleSubmit] appel api.createDocumentRequest', payload);
    this.api
      .createDocumentRequest(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (created) => {
          console.log('[subscribe:next] DocumentRequestDto reçu du backend', created);
          console.log('[Pilote] réponse serveur après création demande', {
            tenantId: this.identity.getTenantId(),
            requestNumberOrDisplayId: created.id,
            internalId: created.internalId,
            status: created.status,
          });
          this.submitSuccess = true;
          this.submitSuccessRef = created.id;
          this.submitSuccessInternalId = created.internalId;
          this.submitSuccessTenant = this.identity.getTenantId() || null;
          this.reason = '';
          this.complementaryComments = '';
          this.otherDescription = '';
          this.otherDescriptionError = false;
          if (this.docTypes.length > 0) {
            this.documentTypeKey = this.docTypes[0]!.id;
          } else {
            this.documentTypeKey = OTHER_KEY;
          }
          window.setTimeout(() => {
            this.submitSuccess = false;
          }, 4000);
        },
        error: (err: unknown) => {
          console.error('[subscribe:error]', err);
          this.submitError = this.formatHttpError(err);
        },
      });
  }

  onDocTypeChange(value: string): void {
    this.documentTypeKey = value;
    this.otherDescriptionError = false;
    if (value !== OTHER_KEY) {
      this.otherDescription = '';
    }
  }

  private formatHttpError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string; detail?: string } | null;
      if (body?.message && typeof body.message === 'string') {
        return body.message;
      }
      if (body?.detail && typeof body.detail === 'string') {
        return body.detail;
      }
      return err.message || `Erreur HTTP ${err.status}`;
    }
    return 'Une erreur inattendue est survenue.';
  }
}
