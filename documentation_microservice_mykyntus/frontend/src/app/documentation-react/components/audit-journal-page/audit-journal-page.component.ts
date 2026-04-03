import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DocumentationIdentityService } from '../../../core/services/documentation-identity.service';
import type { AuditLogDto } from '../../../shared/models/api.models';
import { switchMapOnDocumentationContext } from '../../lib/documentation-context-refresh';
import type { AuditAccessRow } from '../../models/audit-access.data';
import { DocumentationApiService } from '../../services/documentation-api.service';
import {
  AuditInterfaceNavService,
  type AuditInterfaceSectionId,
} from '../../services/audit-interface-nav.service';

interface AuditRow {
  id: string;
  datetime: string;
  user: string;
  action: string;
  item: string;
  status: string;
  departement: string;
  pole: string;
  cellule: string;
  roleMetier: string;
}

function formatDt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('fr-FR');
}

function mapLogToJournalRow(a: AuditLogDto): AuditRow {
  const ok = a.success !== false;
  return {
    id: a.id,
    datetime: formatDt(a.occurredAt),
    user: a.actorName ?? a.actorUserId ?? '—',
    action: a.action,
    item: [a.entityType, a.entityId].filter(Boolean).join(' · ') || '—',
    status: ok ? 'Validé' : 'En attente',
    departement: '—',
    pole: '—',
    cellule: '—',
    roleMetier: '—',
  };
}

function mapLogToAccessRow(a: AuditLogDto): AuditAccessRow {
  return {
    id: a.id,
    user: a.actorName ?? a.actorUserId ?? '—',
    datetime: formatDt(a.occurredAt),
    ip: '—',
    location: '—',
    success: a.success !== false,
    type: a.action,
    role: '—',
    departement: '—',
  };
}

@Component({
  selector: 'app-audit-journal-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-journal-page.component.html',
})
export class AuditJournalPageComponent implements OnInit, OnDestroy {
  @Input() title = "Journal d'audit";

  section: AuditInterfaceSectionId = 'journal';
  rows: AuditRow[] = [];
  accessRows: AuditAccessRow[] = [];
  anomalies: Array<{
    id: string;
    title: string;
    description: string;
    user: string;
    severity: string;
  }> = [];

  loading = true;
  loadError: string | null = null;

  private sub = new Subscription();

  constructor(
    private readonly auditNav: AuditInterfaceNavService,
    private readonly api: DocumentationApiService,
    private readonly identity: DocumentationIdentityService,
  ) {}

  ngOnInit(): void {
    this.section = this.auditNav.section;
    this.sub.add(
      switchMapOnDocumentationContext(this.identity, () => this.api.getAllAuditLogs()).subscribe({
        next: (logs) => {
          this.rows = logs.map(mapLogToJournalRow);
          this.accessRows = logs.map(mapLogToAccessRow);
          this.anomalies = logs
            .filter((a) => a.success === false)
            .map((a) => ({
              id: a.id,
              title: a.action,
              description: [a.entityType, a.entityId, a.errorMessage].filter(Boolean).join(' · ') || '—',
              user: a.actorName ?? a.actorUserId ?? '—',
              severity: 'CRITICAL',
            }));
          this.loading = false;
          this.loadError = null;
        },
        error: () => {
          this.rows = [];
          this.accessRows = [];
          this.anomalies = [];
          this.loading = false;
          this.loadError = 'Impossible de charger les journaux d’audit.';
        },
      }),
    );
    this.sub.add(this.auditNav.section$.subscribe((s) => (this.section = s)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  countRowsValide(): number {
    return this.rows.filter((r) => r.status === 'Validé').length;

  }



  countRowsEnAttente(): number {

    return this.rows.filter((r) => r.status !== 'Validé').length;

  }

}

