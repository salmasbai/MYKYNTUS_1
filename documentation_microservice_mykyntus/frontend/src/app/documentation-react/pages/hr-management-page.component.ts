import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DocumentationDataApiService } from '../../core/services/documentation-data-api.service';
import { DocumentationNotificationService } from '../../core/services/documentation-notification.service';
import type { DocumentRequestDto } from '../../shared/models/api.models';
import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';
import type { DocumentationRole } from '../interfaces/documentation-role';
import { switchMapOnDocumentationContext } from '../lib/documentation-context-refresh';
import type { DocumentationRequest } from '../interfaces/documentation-entities';
import { mapDocumentRequestDto } from '../lib/documentation-dto-mappers';
import { DocumentationApiService } from '../services/documentation-api.service';
import { DocumentationNavigationService } from '../services/documentation-navigation.service';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';
import { StatusBadgeComponent } from '../components/status-badge/status-badge.component';

@Component({
  standalone: true,
  selector: 'app-hr-management-page',
  imports: [CommonModule, FormsModule, DocIconComponent, StatusBadgeComponent],
  templateUrl: './hr-management-page.component.html',
})
export class HrManagementPageComponent implements OnInit, OnDestroy {
  readonly role$ = this.nav.role$;

  requests: DocumentationRequest[] = [];
  loading = true;
  error: string | null = null;

  /** Ligne en cours d’appel API (approve / reject). */
  actionBusyInternalId: string | null = null;
  /** Saisie du motif de rejet. */
  rejectTargetInternalId: string | null = null;
  rejectEmployeeLabel = '';
  rejectReason = '';

  private sub = new Subscription();

  constructor(
    private readonly nav: DocumentationNavigationService,
    private readonly api: DocumentationApiService,
    private readonly dataApi: DocumentationDataApiService,
    private readonly notify: DocumentationNotificationService,
    private readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.sub.add(
      switchMapOnDocumentationContext(this.identity, () => this.api.getAllDocumentRequests()).subscribe({
        next: (rows) => {
          this.requests = rows.map(mapDocumentRequestDto);
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.requests = [];
          this.loading = false;
          this.error = 'Impossible de charger les demandes.';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0] ?? '')
      .join('')
      .slice(0, 3)
      .toUpperCase();
  }

  canApproveReject(role: DocumentationRole): boolean {
    return role === 'RH';
  }

  /** Affiche Approuver / Rejeter si RH, demande en attente, et le backend autorise l’action. */
  showRhWorkflowActions(req: DocumentationRequest, role: DocumentationRole): boolean {
    if (!this.canApproveReject(role) || req.status !== 'Pending') return false;
    const a = req.allowedActions;
    if (!a.length) return true;
    return a.includes('approve') || a.includes('reject');
  }

  canGenerate(role: DocumentationRole): boolean {
    return role === 'RH' || role === 'Admin';
  }

  countStatus(status: DocumentationRequest['status']): number {
    return this.requests.filter((r) => r.status === status).length;
  }

  onApprove(req: DocumentationRequest): void {
    if (this.actionBusyInternalId) return;
    this.actionBusyInternalId = req.internalId;
    this.dataApi
      .workflowApprove({ documentRequestId: req.internalId })
      .pipe(finalize(() => (this.actionBusyInternalId = null)))
      .subscribe({
        next: (dto) => {
          this.applyDtoToList(dto);
          this.notify.showSuccess('Demande approuvée.');
        },
        error: (e: unknown) => this.handleWorkflowError(e),
      });
  }

  onRejectClick(req: DocumentationRequest): void {
    this.rejectTargetInternalId = req.internalId;
    this.rejectEmployeeLabel = req.employeeName;
    this.rejectReason = '';
  }

  cancelReject(): void {
    this.rejectTargetInternalId = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    const id = this.rejectTargetInternalId;
    if (!id || !this.rejectReason.trim() || this.actionBusyInternalId) return;
    this.actionBusyInternalId = id;
    this.dataApi
      .workflowReject({
        documentRequestId: id,
        rejectionReason: this.rejectReason.trim(),
      })
      .pipe(finalize(() => (this.actionBusyInternalId = null)))
      .subscribe({
        next: (dto) => {
          this.rejectTargetInternalId = null;
          this.rejectReason = '';
          this.applyDtoToList(dto);
          this.notify.showSuccess('Demande rejetée.');
        },
        error: (e: unknown) => this.handleWorkflowError(e),
      });
  }

  rowBusy(req: DocumentationRequest): boolean {
    return this.actionBusyInternalId === req.internalId;
  }

  private applyDtoToList(dto: DocumentRequestDto): void {
    const mapped = mapDocumentRequestDto(dto);
    const i = this.requests.findIndex((r) => r.internalId === mapped.internalId);
    if (i >= 0) {
      this.requests[i] = mapped;
    }
  }

  private handleWorkflowError(e: unknown): void {
    if (e instanceof HttpErrorResponse) {
      const body = e.error;
      if (body && typeof body === 'object' && 'message' in body) {
        this.notify.showError(String((body as { message?: string }).message));
        return;
      }
      this.notify.showError(e.message || 'Action refusée par le serveur.');
      return;
    }
    this.notify.showError('Erreur réseau ou serveur.');
  }
}
