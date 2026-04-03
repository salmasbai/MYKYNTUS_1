import React from 'react';

interface BadgeProps {
  status: string;
}

const statusLabels: Record<string, string> = {
  Generated: 'Généré',
  Approved: 'Approuvé',
  Pending: 'En attente',
  Rejected: 'Rejeté',
};

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    Generated: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Approved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
};
