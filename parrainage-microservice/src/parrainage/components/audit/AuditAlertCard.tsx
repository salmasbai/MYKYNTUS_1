import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AuditAlertCardProps {
  level: 'Critique' | 'Moyen';
  message: string;
}

export const AuditAlertCard: React.FC<AuditAlertCardProps> = ({ level, message }) => {
  const critical = level === 'Critique';
  return (
    <div className={`rounded-xl border p-4 ${critical ? 'border-rose-500/40 bg-rose-500/10' : 'border-amber-500/40 bg-amber-500/10'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${critical ? 'text-rose-300' : 'text-amber-300'}`} />
          <div>
            <p className={`text-xs uppercase tracking-wide ${critical ? 'text-rose-300' : 'text-amber-300'}`}>{level}</p>
            <p className="text-sm text-slate-100 mt-1">{message}</p>
          </div>
        </div>
        <button type="button" className="text-xs px-3 py-1.5 rounded-md bg-navy-900 border border-navy-700 text-slate-200 hover:bg-navy-800 transition-colors">
          Voir détail
        </button>
      </div>
    </div>
  );
};
