import React from 'react';
import { Filter } from 'lucide-react';

interface FiltersBarProps {
  status: string;
  setStatus: (value: string) => void;
  dateRange: string;
  setDateRange: (value: string) => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  status,
  setStatus,
  dateRange,
  setDateRange,
}) => (
  <div className="card-navy mb-4 p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <Filter className="h-4 w-4 text-soft-blue" />
      <span className="font-medium">Filtres</span>
    </div>
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-slate-500">Statut</label>
        <select
          className="rounded-lg border border-navy-800 bg-navy-900 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 min-w-[120px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Tous</option>
          <option value="SUBMITTED">En attente</option>
          <option value="APPROVED">Validé</option>
          <option value="REJECTED">Rejeté</option>
          <option value="REWARDED">Prime versée</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-slate-500">Période</label>
        <select
          className="rounded-lg border border-navy-800 bg-navy-900 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 min-w-[140px]"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="3m">3 derniers mois</option>
          <option value="6m">6 derniers mois</option>
          <option value="12m">12 derniers mois</option>
          <option value="all">Depuis le début</option>
        </select>
      </div>
    </div>
  </div>
);
