import React from 'react';
import { ReferralTimelineItem } from '../types';
import { ICONS } from '../types';

interface TimelineProps {
  items: ReferralTimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const Clock = ICONS.Clock;
  const Check = ICONS.Check;
  const X = ICONS.X;

  return (
    <ol className="relative border-l border-navy-800 pl-4 space-y-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon =
          item.label.toLowerCase().includes('refus') || item.label.toLowerCase().includes('rejet')
            ? X
            : item.status === 'done'
            ? Check
            : Clock;

        const iconColor =
          item.label.toLowerCase().includes('refus') || item.label.toLowerCase().includes('rejet')
            ? 'text-red-400 bg-red-500/10 border-red-500/40'
            : item.status === 'done'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40'
            : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/40';

        return (
          <li key={item.id} className={!isLast ? 'pb-2' : ''}>
            <div className="absolute -left-[10px] flex h-5 w-5 items-center justify-center rounded-full border bg-navy-900">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${iconColor}`}
              >
                <Icon className="h-3 w-3" />
              </span>
            </div>
            <div className="ml-4 space-y-1">
              <p className="text-xs font-semibold text-slate-100">{item.label}</p>
              {item.date && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.date}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

