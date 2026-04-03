import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface DashboardStats {
  totalEvents: number;
  infoCount: number;
  warningCount: number;
  criticalCount: number;
}

export interface AuditLogRow {
  id: string;
  datetime: string;
  user: string;
  action: string;
  section: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  getDashboardStats(): Observable<DashboardStats> {
    return of({
      totalEvents: 128,
      infoCount: 92,
      warningCount: 28,
      criticalCount: 8,
    });
  }

  getAuditLogs(): Observable<AuditLogRow[]> {
    return of([
      {
        id: 'log-1',
        datetime: '2026-03-31 09:10',
        user: 'Audit Bot',
        action: 'CREATE',
        section: 'journal',
        status: 'OK',
      },
      {
        id: 'log-2',
        datetime: '2026-03-31 10:22',
        user: 'Admin Prime',
        action: 'APPROVE',
        section: 'historique',
        status: 'OK',
      },
      {
        id: 'log-3',
        datetime: '2026-03-31 11:40',
        user: 'Compliance',
        action: 'CONFIG',
        section: 'reporting',
        status: 'WARNING',
      },
      {
        id: 'log-4',
        datetime: '2026-03-31 12:15',
        user: 'Risk Team',
        action: 'DELETE',
        section: 'anomalies',
        status: 'CRITICAL',
      },
    ]);
  }
}
