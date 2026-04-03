import React from 'react';
import { AlertTriangle, GitBranch } from 'lucide-react';
import { ANOMALIES_DEMO, type AnomalyRow } from './auditDemoData';
import { SeverityBadge } from './AuditBadges';

function PriorityBadge({ p }: { p: AnomalyRow['priority'] }) {
  const cls =
    p === 'P1'
      ? 'bg-rose-600/25 text-rose-200 border-rose-500/50'
      : p === 'P2'
        ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
        : 'bg-slate-600/30 text-slate-300 border-slate-500/40';
  return <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${cls}`}>{p}</span>;
}

interface AnomaliesPanelProps {
  onInvestigate: (a: AnomalyRow) => void;
  /** Timeline sur l’utilisateur lié (si connu) */
  onOpenTimeline?: (a: AnomalyRow) => void;
}

export const AnomaliesPanel: React.FC<AnomaliesPanelProps> = ({ onInvestigate, onOpenTimeline }) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Détection automatique : suppressions massives, géolocalisation, plages horaires. Les cas ci-dessous sont des exemples
        démo.
      </p>
      <div className="grid gap-3">
        {ANOMALIES_DEMO.map((a) => (
          <div
            key={a.id}
            className="card-navy p-4 border border-rose-900/30 bg-rose-950/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-rose-800/50 transition-colors duration-200"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold text-slate-100">{a.title}</span>
                <SeverityBadge level={a.severityUi} />
                <PriorityBadge p={a.priority} />
                <span className="text-[11px] text-slate-500">{a.category}</span>
              </div>
              <p className="text-sm text-slate-400">{a.description}</p>
              <p className="text-[11px] text-slate-500">Détecté : {a.detectedAt}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {onOpenTimeline && a.relatedUserLabel && (
                <button
                  type="button"
                  onClick={() => onOpenTimeline(a)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-navy-600 text-slate-300 text-sm hover:bg-navy-800 transition-colors"
                >
                  <GitBranch className="w-4 h-4" />
                  Timeline
                </button>
              )}
              <button
                type="button"
                onClick={() => onInvestigate(a)}
                className="px-4 py-2 rounded-lg border border-blue-500/40 bg-blue-600/15 text-blue-200 text-sm hover:bg-blue-600/25 transition-colors"
              >
                Investiguer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
