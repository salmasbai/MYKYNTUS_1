import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import { DocumentationNotificationService } from '../../../core/services/documentation-notification.service';
import type { DocumentRequestDto } from '../../../shared/models/api.models';

@Component({
  selector: 'app-requests-list-page',
  templateUrl: './requests-list-page.component.html',
  styleUrls: ['./requests-list-page.component.css'],
})
export class RequestsListPageComponent implements OnInit {
  requests: DocumentRequestDto[] = [];
  page = 1;
  pageSize = 20;
  pageInput = 1;
  totalCount = 0;
  loading = true;
  error: string | null = null;

  statusFilter = '';
  typeFilter = '';
  roleFilter = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  readonly statusOptions: { value: string; label: string }[] = [
    { value: '', label: 'Tous statuts' },
    { value: 'pending', label: 'pending' },
    { value: 'approved', label: 'approved' },
    { value: 'rejected', label: 'rejected' },
    { value: 'generated', label: 'generated' },
    { value: 'cancelled', label: 'cancelled' },
  ];

  readonly typeOptions: { value: string; label: string }[] = [
    { value: '', label: 'Tous types' },
    { value: 'catalog', label: 'Catalogue' },
    { value: 'custom', label: 'Autre (custom)' },
  ];

  readonly roleOptions: { value: string; label: string }[] = [
    { value: '', label: 'Tous rôles (demandeur)' },
    { value: 'pilote', label: 'pilote' },
    { value: 'coach', label: 'coach' },
    { value: 'manager', label: 'manager' },
    { value: 'rp', label: 'rp' },
    { value: 'rh', label: 'rh' },
    { value: 'admin', label: 'admin' },
    { value: 'audit', label: 'audit' },
  ];

  readonly sortByOptions: { value: string; label: string }[] = [
    { value: 'createdAt', label: 'Date de création' },
    { value: 'status', label: 'Statut' },
    { value: 'requestNumber', label: 'N° demande' },
  ];

  constructor(
    private readonly api: DocumentationDataApiService,
    private readonly notify: DocumentationNotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api
      .getDocumentRequests(this.page, this.pageSize, {
        status: this.statusFilter || undefined,
        type: this.typeFilter || undefined,
        role: this.roleFilter || undefined,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      })
      .subscribe({
        next: (p) => {
          this.requests = p.items;
          this.totalCount = p.totalCount;
          this.pageInput = this.page;
          this.loading = false;
        },
        error: (e: unknown) => {
          const msg = this.formatHttpError(e);
          this.error = msg;
          this.notify.showError(msg);
          this.loading = false;
        },
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.load();
    }
  }

  goToPage(): void {
    const target = Math.max(1, Math.min(this.totalPages, Math.floor(Number(this.pageInput)) || 1));
    this.pageInput = target;
    this.page = target;
    this.load();
  }

  private formatHttpError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const body = e.error;
      if (body && typeof body === 'object' && 'message' in body) {
        return String((body as { message?: string }).message);
      }
      return e.message || 'Erreur serveur.';
    }
    return 'Erreur réseau ou serveur.';
  }
}
