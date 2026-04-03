import React from 'react';

interface AuditKpiCardProps {
  title: string;
  value: number;
  subtitle: string;
  trend?: string;
  icon: React.ReactNode;
  accent: 'blue' | 'green' | 'amber' | 'rose';
}

const accentClasses: Record<AuditKpiCardProps['accent'], string> = {
  blue: 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.12)]',
  green: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.12)]',
  amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.12)]',
  rose: 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.12)]',
};

export const AuditKpiCard: React.FC<AuditKpiCardProps> = ({ title, value, subtitle, trend, icon, accent }) => {
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br from-navy-900 to-navy-950 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(15,23,42,0.7)] ${accentClasses[accent]}`}
    >
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-navy-800/80 border border-navy-700 flex items-center justify-center text-slate-200">
          {icon}
        </div>
        {trend ? (
          <span className="text-[11px] px-2 py-1 rounded-md bg-navy-800 text-slate-300">{trend}</span>
        ) : null}
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wide mt-3">{title}</p>
      <p className="text-2xl text-white font-bold mt-1">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
};
