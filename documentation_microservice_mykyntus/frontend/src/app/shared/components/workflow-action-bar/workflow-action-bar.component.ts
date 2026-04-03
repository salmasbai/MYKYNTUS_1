import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import { DocumentationNotificationService } from '../../../core/services/documentation-notification.service';
import type { DocumentRequestDto } from '../../models/api.models';

/**
 * Affiche uniquement les actions renvoyées par le backend (allowedActions). Aucune règle métier locale.
 */
@Component({
  selector: 'app-workflow-action-bar',
  templateUrl: './workflow-action-bar.component.html',
  styleUrls: ['./workflow-action-bar.component.css'],
})
export class WorkflowActionBarComponent {
  @Input({ required: true }) request!: DocumentRequestDto;
  @Output() readonly requestUpdated = new EventEmitter<DocumentRequestDto>();

  rejectMode = false;
  rejectReason = '';
  busy = false;
  error: string | null = null;

  constructor(
    private readonly api: DocumentationDataApiService,
    private readonly notify: DocumentationNotificationService,
  ) {}

  actionLabel(action: string): string {
    switch (action) {
      case 'validate':
        return 'Valider';
      case 'approve':
        return 'Approuver';
      case 'reject':
        return 'Rejeter';
      default:
        return action;
    }
  }

  onActionClick(action: string): void {
    this.error = null;
    if (action === 'reject') {
      this.rejectMode = true;
      return;
    }
    const obs = this.buildRequest$(action);
    if (!obs) return;
    this.run(obs);
  }

  confirmReject(): void {
    if (!this.rejectReason.trim()) {
      return;
    }
    this.error = null;
    this.run(
      this.api.workflowReject({
        documentRequestId: this.request.internalId,
        rejectionReason: this.rejectReason.trim(),
      }),
    );
  }

  cancelReject(): void {
    this.rejectMode = false;
    this.rejectReason = '';
  }

  private buildRequest$(action: string): Observable<DocumentRequestDto> | null {
    const id = this.request.internalId;
    if (action === 'validate') {
      return this.api.workflowValidate({ documentRequestId: id });
    }
    if (action === 'approve') {
      return this.api.workflowApprove({ documentRequestId: id });
    }
    return null;
  }

  private run(obs: Observable<DocumentRequestDto>): void {
    this.busy = true;
    obs.subscribe({
      next: (r) => {
        this.busy = false;
        this.rejectMode = false;
        this.rejectReason = '';
        this.requestUpdated.emit(r);
      },
      error: (e: unknown) => {
        this.busy = false;
        const msg = this.formatHttpError(e);
        this.error = msg;
        this.notify.showError(msg);
      },
    });
  }

  private formatHttpError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const body = e.error;
      if (body && typeof body === 'object' && 'message' in body) {
        return String((body as { message?: string }).message);
      }
      return e.message || 'Action refusée par le serveur.';
    }
    return 'Erreur réseau ou serveur.';
  }
}
