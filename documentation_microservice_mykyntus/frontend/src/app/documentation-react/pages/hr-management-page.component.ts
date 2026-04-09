import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DocumentationDataApiService } from '../../core/services/documentation-data-api.service';
import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';
import { DocumentationNotificationService } from '../../core/services/documentation-notification.service';
import type { DocumentRequestDto } from '../../shared/models/api.models';
import type { DocumentationRole } from '../interfaces/documentation-role';
import { switchMapOnDocumentationContext } from '../lib/documentation-context-refresh';
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

  requests: DocumentRequestDto[] = [];
  loading = true;
  error: string | null = null;

  rejectingFor: DocumentRequestDto | null = null;
  rejectReason = '';

  /** Ligne en cours d’action workflow (internalId). */
  busyWorkflowId: string | null = null;
  /** Ligne en cours de génération PDF. */
  busyGenerateId: string | null = null;

  private sub = new Subscription();

  constructor(
    private readonly nav: DocumentationNavigationService,
    private readonly api: DocumentationApiService,
    private readonly data: DocumentationDataApiService,
    private readonly identity: DocumentationIdentityService,
    private readonly notify: DocumentationNotificationService,
  ) {}

  /** Recharge la file après action métier (PUT workflow). */
  private refreshAfterWorkflow(updated: DocumentRequestDto): void {
    this.patchRow(updated);
    if (updated.status === 'Approved' || updated.status === 'Rejected') {
      this.reloadQueue();
    }
  }

  ngOnInit(): void {
    this.sub.add(
      switchMapOnDocumentationContext(this.identity, () => this.api.getAllDocumentRequests()).subscribe({
        next: (rows) => {
          this.requests = rows;
          this.loading = false;
          this.error = null;
        },
        error: (err) => {
          console.error('[RH] chargement demandes', err);
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

  reloadQueue(): void {
    this.loading = true;
    this.error = null;
    this.sub.add(
      this.api.getAllDocumentRequests().subscribe({
        next: (rows) => {
          this.requests = rows;
          this.loading = false;
        },
        error: (err) => {
          console.error('[RH] rechargement demandes', err);
          this.loading = false;
          this.error = 'Impossible de charger les demandes.';
        },
      }),
    );
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

  allowed(req: DocumentRequestDto, action: string): boolean {
    return !!req.allowedActions?.includes(action);
  }

  canGenerate(role: DocumentationRole, req: DocumentRequestDto): boolean {
    if (req.status !== 'Approved') return false;
    return role === 'RH' || role === 'Admin';
  }

  countStatus(status: DocumentRequestDto['status']): number {
    return this.requests.filter((r) => r.status === status).length;
  }

  goUploadTemplates(): void {
    this.nav.navigateToTab('templates');
  }

  openRequestTracking(): void {
    this.nav.navigateToTab('tracking');
  }

  onAdvancedFilter(): void {
    this.notify.showSuccess('Filtres avancés : à venir (la liste charge déjà toutes les demandes du tenant).');
  }

  validateRequest(req: DocumentRequestDto): void {
    if (this.busyWorkflowId || !this.allowed(req, 'validate')) return;
    this.busyWorkflowId = req.internalId;
    this.api.validateDocumentRequest(req.internalId).subscribe({
      next: (updated) => {
        this.refreshAfterWorkflow(updated);
        this.busyWorkflowId = null;
        this.notify.showSuccess('Demande validée.');
      },
      error: (e) => {
        this.busyWorkflowId = null;
        const msg = this.formatHttpError(e);
        console.error('[RH] validate', e);
        this.notify.showError(msg);
      },
    });
  }

  approveRequest(req: DocumentRequestDto): void {
    if (this.busyWorkflowId || !this.allowed(req, 'approve')) return;
    this.busyWorkflowId = req.internalId;
    this.api.approveDocumentRequest(req.internalId).subscribe({
      next: (updated) => {
        this.refreshAfterWorkflow(updated);
        this.busyWorkflowId = null;
        this.notify.showSuccess('Demande approuvée.');
      },
      error: (e) => {
        this.busyWorkflowId = null;
        const msg = this.formatHttpError(e);
        console.error('[RH] approve', e);
        this.notify.showError(msg);
      },
    });
  }

  startReject(req: DocumentRequestDto): void {
    if (!this.allowed(req, 'reject')) return;
    this.rejectingFor = req;
    this.rejectReason = '';
  }

  confirmReject(): void {
    const req = this.rejectingFor;
    const reason = this.rejectReason.trim();
    if (!req || !reason || this.busyWorkflowId) return;
    this.busyWorkflowId = req.internalId;
    this.api.rejectDocumentRequest(req.internalId, reason).subscribe({
      next: (updated) => {
        this.refreshAfterWorkflow(updated);
        this.busyWorkflowId = null;
        this.rejectingFor = null;
        this.rejectReason = '';
        this.notify.showSuccess('Demande rejetée.');
      },
      error: (e) => {
        this.busyWorkflowId = null;
        const msg = this.formatHttpError(e);
        console.error('[RH] reject', e);
        this.notify.showError(msg);
      },
    });
  }

  cancelReject(): void {
    this.rejectingFor = null;
    this.rejectReason = '';
  }

  generateDocument(req: DocumentRequestDto): void {
    const typeId = req.documentTypeId;
    if (!typeId) {
      this.notify.showError('Pas de type catalogue sur cette demande : créez un modèle ou utilisez une demande liée à un type.');
      return;
    }
    if (this.busyGenerateId) return;
    this.busyGenerateId = req.internalId;
    this.data.getDocumentTemplates().subscribe({
      next: (templates) => {
        const match = templates.find(
          (t) => t.isActive && t.documentTypeId === typeId && t.currentVersionId,
        );
        if (!match) {
          this.busyGenerateId = null;
          this.notify.showError('Aucun modèle actif avec version courante pour ce type de document.');
          return;
        }
        this.data
          .generateFromDocumentTemplate(match.id, {
            documentRequestId: req.internalId,
            documentTypeId: typeId,
            variables: {},
          })
          .subscribe({
            next: () => {
              this.busyGenerateId = null;
              this.notify.showSuccess('Document généré (PDF enregistré).');
              this.reloadQueue();
            },
            error: (e) => {
              this.busyGenerateId = null;
              const msg = this.formatHttpError(e);
              console.error('[RH] generate', e);
              this.notify.showError(msg);
            },
          });
      },
      error: (e) => {
        this.busyGenerateId = null;
        console.error('[RH] liste modèles', e);
        this.notify.showError(this.formatHttpError(e));
      },
    });
  }

  private patchRow(updated: DocumentRequestDto): void {
    const i = this.requests.findIndex((r) => r.internalId === updated.internalId);
    if (i < 0) {
      this.reloadQueue();
      return;
    }
    const next = this.requests.slice();
    next[i] = updated;
    this.requests = next;
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
