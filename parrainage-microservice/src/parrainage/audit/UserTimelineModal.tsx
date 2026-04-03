import React from 'react';
import { X } from 'lucide-react';
import { AuditTimeline } from '../components/audit/AuditTimeline';
import type { JournalRow } from './auditTypes';

interface UserTimelineModalProps {
  userLabel: string;
  rows: JournalRow[];
  open: boolean;
  onClose: () => void;
}

export const UserTimelineModal: React.FC<UserTimelineModalProps> = ({ userLabel, rows, open, onClose }) => {
  if (!open) return null;

  const items = [...rows]
    .filter((r) => r.employee === userLabel)
    .sort((a, b) => b.datetime.localeCompare(a.datetime))
    .map((r) => ({
      id: r.id,
      action: `${r.action} · ${r.actionCode}`,
      item: r.item,
      datetime: r.datetime,
    }));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/70"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="presentation"
    >
      <div
        className="card-navy w-full max-w-lg max-h-[85vh] flex flex-col border border-navy-700 shadow-xl duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b border-navy-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Timeline — {userLabel}</h3>
            <p className="text-xs text-slate-500">{items.length} événement(s)</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-navy-800 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune action pour cet utilisateur sur la période chargée.</p>
          ) : (
            <AuditTimeline items={items} />
          )}
        </div>
      </div>
    </div>
  );
};
