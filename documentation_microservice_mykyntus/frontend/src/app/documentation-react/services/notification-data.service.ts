import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DocumentationIdentityService } from '../../core/services/documentation-identity.service';
import type { AuditLogDto } from '../../shared/models/api.models';
import type { NotificationItemUi } from '../models/notification-item.model';
import { DocumentationApiService } from './documentation-api.service';

const READ_STORAGE_KEY = 'documentation-notifications-read-ids';

function parseOccurrence(iso: string): Date {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function dateGroupLabel(iso: string): string {
  const d = parseOccurrence(iso);
  const today = new Date();
  const y = (x: Date) => x.toDateString();
  if (y(d) === y(today)) return "Aujourd'hui";
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  if (y(d) === y(yest)) return 'Hier';
  return 'Plus tôt';
}

function formatTimestamp(iso: string): string {
  const d = parseOccurrence(iso);
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

function auditToUi(a: AuditLogDto, read: boolean): NotificationItemUi {
  const ok = a.success !== false;
  return {
    id: a.id,
    type: a.entityType?.toLowerCase().includes('notification') ? 'system' : 'documents',
    icon: ok ? 'file-text' : 'x-circle',
    title: a.action,
    description: [a.entityType, a.entityId, a.errorMessage].filter(Boolean).join(' · ') || '—',
    timestamp: formatTimestamp(a.occurredAt),
    dateGroup: dateGroupLabel(a.occurredAt),
    read,
    iconColor: ok ? 'text-blue-400' : 'text-red-400',
    bgColor: ok ? 'bg-blue-500/10' : 'bg-red-500/10',
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationDataService {
  private logs: AuditLogDto[] = [];
  private readonly readIds = new Set<string>();
  private readonly tick = new BehaviorSubject(0);

  /** Notifie les observateurs après chargement ou changement d’état lu. */
  readonly updated$ = this.tick.asObservable();

  constructor(
    private readonly api: DocumentationApiService,
    identity: DocumentationIdentityService,
  ) {
    try {
      const raw = localStorage.getItem(READ_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) arr.forEach((id) => this.readIds.add(id));
      }
    } catch {
      /* ignore */
    }
    this.reloadFromApi();
    identity.contextRevision$.subscribe(() => this.reloadFromApi());
  }

  reloadFromApi(): void {
    this.api.getDataAuditLogs(1, 40).subscribe({
      next: (page) => {
        this.logs = page.items;
        this.tick.next(this.tick.value + 1);
      },
      error: () => {
        this.logs = [];
        this.tick.next(this.tick.value + 1);
      },
    });
  }

  private persistRead(): void {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...this.readIds]));
  }

  private emit(): void {
    this.tick.next(this.tick.value + 1);
  }

  list(): NotificationItemUi[] {
    return this.logs.map((a) => auditToUi(a, this.readIds.has(a.id)));
  }

  unreadCount(): number {
    return this.logs.filter((a) => !this.readIds.has(a.id)).length;
  }

  markRead(id: string): void {
    this.readIds.add(id);
    this.persistRead();
    this.emit();
  }

  markAllRead(): void {
    for (const a of this.logs) this.readIds.add(a.id);
    this.persistRead();
    this.emit();
  }

  remove(id: string): void {
    this.logs = this.logs.filter((a) => a.id !== id);
    this.readIds.delete(id);
    this.persistRead();
    this.emit();
  }
}
