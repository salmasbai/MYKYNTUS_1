import React from 'react';
import { ICONS } from '../types';

interface KpiCardProps {
  label: string;
  value: string | number;
  accent?: 'blue' | 'green' | 'yellow' | 'red';
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, accent = 'blue' }) => {
  const Activity = ICONS.Activity;

  const accentClass =
    accent === 'green'
      ? 'border-emerald-500/40 bg-emerald-500/5'
      : accent === 'yellow'
      ? 'border-yellow-500/40 bg-yellow-500/5'
      : accent === 'red'
      ? 'border-red-500/40 bg-red-500/5'
      : 'border-soft-blue/40 bg-soft-blue/5';

  return (
    <div className="card-navy p-4 md:p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${accentClass}`}
        >
          <Activity className="h-4 w-4 text-soft-blue" />
        </span>
      </div>
      <p className="text-xl md:text-2xl font-semibold text-slate-50">{value}</p>
    </div>
  );
};

