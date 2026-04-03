import React from 'react';

interface TimelineItem {
  id: string;
  action: string;
  item: string;
  datetime: string;
}

interface AuditTimelineProps {
  items: TimelineItem[];
}

const badgeClass = (action: string) => {
  if (action.toLowerCase().includes('generated')) return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  if (action.toLowerCase().includes('download')) return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
  if (action.toLowerCase().includes('approved') || action.toLowerCase().includes('valid')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
};

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ items }) => {
  return (
    <div className="max-h-72 overflow-y-auto pr-1 space-y-4">
      {items.map((it) => (
        <div key={it.id} className="relative pl-8">
          <span className="absolute left-[11px] top-0 bottom-0 w-px bg-navy-700" />
          <span className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full bg-navy-900 border border-navy-700" />
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className={`inline-flex text-[11px] px-2 py-0.5 rounded-md border ${badgeClass(it.action)}`}>{it.action}</span>
              <p className="text-sm text-slate-200">{it.item}</p>
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">{it.datetime}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
