import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DocumentationIdentityService } from '../../../core/services/documentation-identity.service';
import type { DocumentationRole } from '../../interfaces/documentation-role';
import { switchMapOnDocumentationContext } from '../../lib/documentation-context-refresh';
import type { DocumentationRequest } from '../../interfaces/documentation-entities';
import { filterByEmployeeScope } from '../../lib/documentation-filters';
import { mapDocumentRequestDto } from '../../lib/documentation-dto-mappers';
import type { HierarchyDrillSelection } from '../../lib/documentation-org-hierarchy';
import { DocumentationApiService } from '../../services/documentation-api.service';
import { DocumentationHierarchyDrillService } from '../../services/documentation-hierarchy-drill.service';
import { DocDrillBarComponent } from '../doc-drill-bar/doc-drill-bar.component';
import { DocIconComponent } from '../doc-icon/doc-icon.component';

const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

@Component({
  selector: 'app-rp-dashboard',
  standalone: true,
  imports: [CommonModule, DocIconComponent, DocDrillBarComponent],
  templateUrl: './rp-dashboard.component.html',
})
export class RpDashboardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) role!: DocumentationRole;

  drill: HierarchyDrillSelection = {};
  private sub = new Subscription();

  loading = true;
  error: string | null = null;
  private allRequests: DocumentationRequest[] = [];

  evolutionData: Array<{ name: string; requests: number }> = [];
  typeData: Array<{ name: string; value: number }> = [];

  readonly COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

  constructor(
    private readonly hierarchy: DocumentationHierarchyDrillService,
    private readonly api: DocumentationApiService,
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.hierarchy.drill$.subscribe((d) => {
        this.drill = d;
        this.recomputeCharts();
      }),
    );
    this.sub.add(
      switchMapOnDocumentationContext(this.identity, () => this.api.getAllDocumentRequests()).subscribe({
        next: (rows) => {
          this.allRequests = rows.map(mapDocumentRequestDto);
          this.recomputeCharts();
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.allRequests = [];
          this.evolutionData = [];
          this.typeData = [];
          this.loading = false;
          this.error = 'Impossible de charger les demandes.';
        },
      }),
    );
  }

  private recomputeCharts(): void {
    const scoped = this.scopedReq;
    const now = new Date();
    const byMonth = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth.set(key, 0);
    }
    for (const r of scoped) {
      const d = new Date(r.requestDate);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (byMonth.has(key)) byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
    this.evolutionData = [...byMonth.entries()].map(([km, requests]) => {
      const [y, m] = km.split('-').map(Number);
      return { name: `${MONTHS_FR[m]} ${y}`, requests };
    });

    const byType = new Map<string, number>();
    for (const r of scoped) {
      byType.set(r.type, (byType.get(r.type) ?? 0) + 1);
    }
    const sorted = [...byType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    this.typeData = sorted.map(([name, value]) => ({ name, value }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get scopedReq(): DocumentationRequest[] {
    return filterByEmployeeScope(this.allRequests, this.role, this.drill);
  }

  get totalRequests(): number {
    return this.scopedReq.length;
  }

  get approvalRate(): number {
    const t = this.totalRequests;
    if (t <= 0) return 0;
    const approved = this.scopedReq.filter((r) => r.status === 'Approved' || r.status === 'Generated').length;
    return Math.round((approved / t) * 100);
  }

  get rejectionRate(): number {
    const t = this.totalRequests;
    if (t <= 0) return 0;
    const rejected = this.scopedReq.filter((r) => r.status === 'Rejected').length;
    return Math.round((rejected / t) * 100);
  }

  readonly statsDef = [
    { key: 'tot', label: 'Total des demandes', icon: 'history', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'appr', label: 'Taux d’approbation', icon: 'check-circle-2', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'rej', label: 'Taux de rejet', icon: 'x-circle', color: 'text-red-500', bg: 'bg-red-500/10' },
    { key: 'act', label: 'Utilisateurs actifs', icon: 'users', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  statDisplay(key: string): string | number {
    switch (key) {
      case 'tot':
        return this.totalRequests;
      case 'appr':
        return `${this.approvalRate} %`;
      case 'rej':
        return `${this.rejectionRate} %`;
      case 'act':
        return new Set(this.scopedReq.map((r) => r.employeeId).filter(Boolean)).size;
      default:
        return 0;
    }
  }

  linePoints(): string {
    const data = this.evolutionData.length > 0 ? this.evolutionData : [{ name: '', requests: 0 }];
    const maxY = Math.max(...data.map((d) => d.requests), 1);
    const w = 400;
    const h = 220;
    const pad = 24;
    if (data.length < 2) {
      const x = pad + (w - pad * 2) / 2;
      const y = h - pad - (data[0].requests / maxY) * (h - pad * 2);
      return `${x},${y}`;
    }
    return data
      .map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - (d.requests / maxY) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  lineDots(): Array<{ x: string; y: string }> {
    return this.linePoints()
      .split(' ')
      .filter(Boolean)
      .map((pair) => {
        const [x, y] = pair.split(',');
        return { x, y };
      });
  }

  pieSlice(index: number): string {
    const total = this.typeData.reduce((s, t) => s + t.value, 0);
    if (total <= 0) return '';
    const cx = 110;
    const cy = 110;
    const r = 110;
    const ri = 78;
    let a0 = -Math.PI / 2;
    for (let i = 0; i < index; i++) {
      a0 += (this.typeData[i].value / total) * 2 * Math.PI;
    }
    const sweep = (this.typeData[index].value / total) * 2 * Math.PI;
    const a1 = a0 + sweep;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi0 = cx + ri * Math.cos(a0);
    const yi0 = cy + ri * Math.sin(a0);
    const xi1 = cx + ri * Math.cos(a1);
    const yi1 = cy + ri * Math.sin(a1);
    const large = sweep > Math.PI ? 1 : 0;
    return `M ${xi0} ${yi0} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ri} ${ri} 0 ${large} 0 ${xi0} ${yi0} Z`;
  }
}
