import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { DocumentationDataApiService } from '../../../core/services/documentation-data-api.service';
import { DocumentationNotificationService } from '../../../core/services/documentation-notification.service';
import type { AuditLogDto } from '../../../shared/models/api.models';

@Component({
  selector: 'app-audit-page',
  templateUrl: './audit-page.component.html',
  styleUrls: ['./audit-page.component.css'],
})
export class AuditPageComponent implements OnInit {
  logs: AuditLogDto[] = [];
  page = 1;
  pageSize = 50;
  pageInput = 1;
  totalCount = 0;
  loading = true;
  error: string | null = null;

  actionContains = '';
  roleFilter = '';
  sortBy = 'occurredAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  readonly roleOptions: { value: string; label: string }[] = [
    { value: '', label: 'Tous rôles (acteur)' },
    { value: 'pilote', label: 'pilote' },
    { value: 'coach', label: 'coach' },
    { value: 'manager', label: 'manager' },
    { value: 'rp', label: 'rp' },
    { value: 'rh', label: 'rh' },
    { value: 'admin', label: 'admin' },
    { value: 'audit', label: 'audit' },
  ];

  readonly sortByOptions: { value: string; label: string }[] = [
    { value: 'occurredAt', label: 'Date' },
    { value: 'action', label: 'Action' },
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
    const action = this.actionContains.trim();
    this.api
      .getAuditLogs(this.page, this.pageSize, {
        action: action || undefined,
        role: this.roleFilter || undefined,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      })
      .subscribe({
        next: (p) => {
          this.logs = p.items;
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
