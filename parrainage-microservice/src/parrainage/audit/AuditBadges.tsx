import React from 'react';

export function SeverityBadge({ level }: { level: 'INFO' | 'WARNING' | 'CRITICAL' }) {
  const map = {
    INFO: 'bg-slate-600/30 text-slate-200 border-slate-500/40',
    WARNING: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    CRITICAL: 'bg-rose-600/25 text-rose-200 border-rose-500/50',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border ${map[level]}`}>
      {level}
    </span>
  );
}

/** Badge action métier : vert validation, jaune modification, rouge suppression, bleu création */
export function ActionNatureBadge({ action }: { action: string }) {
  const cls =
    action === 'Validation'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
      : action === 'Modification'
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
        : action === 'Suppression'
          ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
          : action === 'Création'
            ? 'bg-blue-500/15 text-blue-300 border-blue-500/35'
            : 'bg-slate-500/15 text-slate-300 border-slate-600/40';
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs rounded-md border ${cls}`} title={action}>
      {action}
    </span>
  );
}
