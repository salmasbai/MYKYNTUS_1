import React, { useMemo } from 'react';
import type { Referral } from '../models/Referral';

interface MonthlyChartProps {
  referrals: Referral[];
  height?: number;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ referrals, height = 120 }) => {
  const data = useMemo(() => {
    const now = new Date();
    const months: { label: string; count: number; year: number; month: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        count: 0,
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    referrals.forEach((r) => {
      const d = new Date(r.createdAt);
      const m = months.find((x) => x.year === d.getFullYear() && x.month === d.getMonth());
      if (m) m.count++;
    });
    const max = Math.max(1, ...months.map((m) => m.count));
    return months.map((m) => ({ ...m, pct: max > 0 ? (m.count / max) * 100 : 0 }));
  }, [referrals]);

  return (
    <div className="card-navy p-4 md:p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500 mb-4">
        Évolution mensuelle des parrainages
      </p>
      <div className="flex items-end gap-3" style={{ height: 120 }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center h-full">
            <div className="flex-1 w-full flex flex-col justify-end">
              <div
                className="w-full bg-soft-blue/60 rounded-t transition-all"
                style={{ height: `${Math.max(8, d.pct)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1">{d.label}</span>
            <span className="text-xs font-medium text-slate-300">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
