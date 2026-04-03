import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
      [ngClass]="styles[status] || fallback"
    >
      {{ statusLabels[status] || status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;

  readonly statusLabels: Record<string, string> = {
    Generated: 'Généré',
    Approved: 'Approuvé',
    Pending: 'En attente',
    Rejected: 'Rejeté',
    Cancelled: 'Annulé',
  };

  readonly styles: Record<string, string> = {
    Generated: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Approved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    Cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
  };

  readonly fallback = 'bg-slate-500/10 text-slate-500 border-slate-500/20';
}
