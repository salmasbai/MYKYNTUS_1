import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { JournalRow } from './auditTypes';
import { SeverityBadge } from './AuditBadges';

interface AuditDetailsDrawerProps {
  selected: JournalRow | null;
  onClose: () => void;
  onInvestigateUser: () => void;
  onOpenUserTimeline: () => void;
}

export const AuditDetailsDrawer: React.FC<AuditDetailsDrawerProps> = ({
  selected,
  onClose,
  onInvestigateUser,
  onOpenUserTimeline,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selected) {
      const t = setTimeout(() => setOpen(true), 10);
      return () => clearTimeout(t);
    }
    setOpen(false);
    return undefined;
  }, [selected]);

  if (!selected) return null;

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 220);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/55">
      <button type="button" className="flex-1 cursor-default" aria-label="Fermer" onClick={handleClose} />
      <div
        className={`w-full max-w-md h-full bg-navy-900 border-l border-navy-800 p-5 space-y-4 overflow-y-auto shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white">Détail technique</h4>
          <button type="button" onClick={handleClose} className="p-1.5 rounded-md hover:bg-navy-800 transition-colors">
            <X className="w-4 h-4 text-slate-300" />
          </button>
        </div>
        <div className="text-sm space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge level={selected.severity} />
            <span className="text-slate-500 font-mono text-xs">{selected.actionCode}</span>
          </div>
          <div>
            <span className="text-slate-500">Action</span>
            <p className="text-slate-200">{selected.action}</p>
          </div>
          <div>
            <span className="text-slate-500">IP</span>
            <p className="text-slate-200 font-mono text-sm">{selected.ip}</p>
          </div>
          <div>
            <span className="text-slate-500">Device / navigateur</span>
            <p className="text-slate-200">{selected.device}</p>
          </div>
          <div>
            <span className="text-slate-500">Département / Pôle / Cellule</span>
            <p className="text-slate-200">
              {selected.departement} · {selected.pole} · {selected.cellule}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Rôle</span>
            <p className="text-slate-200">{selected.roleMetier}</p>
          </div>
          <div>
            <span className="text-slate-500">Élément</span>
            <p className="text-slate-200">{selected.item}</p>
          </div>
          <div>
            <span className="text-slate-500">Avant / après</span>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <pre className="p-3 rounded-lg bg-navy-950 border border-navy-800 text-[11px] text-slate-400 overflow-x-auto max-h-48">
                {JSON.stringify(selected.beforeState, null, 2)}
              </pre>
              <pre className="p-3 rounded-lg bg-navy-950 border border-emerald-900/30 text-[11px] text-emerald-100/90 overflow-x-auto max-h-48">
                {JSON.stringify(selected.afterState, null, 2)}
              </pre>
            </div>
          </div>
          <div>
            <span className="text-slate-500">Métadonnées</span>
            <pre className="mt-1 p-3 rounded-lg bg-navy-950 border border-navy-800 text-[11px] text-slate-400 overflow-x-auto">
              {JSON.stringify(selected.metadata, null, 2)}
            </pre>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={onOpenUserTimeline}
              className="w-full py-2.5 rounded-lg border border-blue-500/40 bg-blue-600/15 text-blue-200 text-sm hover:bg-blue-600/25 transition-colors"
            >
              Voir toutes les actions de cet utilisateur (timeline)
            </button>
            <button
              type="button"
              onClick={onInvestigateUser}
              className="w-full py-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm hover:bg-amber-500/20 transition-colors"
            >
              Mode investigation — filtrer le journal sur cet utilisateur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
