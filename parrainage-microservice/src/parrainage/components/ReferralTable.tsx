import React from 'react';
import { FileText } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Referral, ReferralStatus } from '../models/Referral';
import { useNavigation } from '../../../frontend/app/providers/NavigationProvider';

interface ReferralTableProps {
  referrals: Referral[];
  loading?: boolean;
  onApprove?: (r: Referral) => void;
  onReject?: (r: Referral) => void;
  onViewDetails?: (r: Referral) => void;
  showActions?: boolean;
  scope?: 'admin' | 'pm';
  /** 'link' = navigate to /rh/details/:id; 'modal' = call onViewDetails(r) to open drawer. Default: 'link' */
  detailMode?: 'link' | 'modal';
}

export const ReferralTable: React.FC<ReferralTableProps> = ({
  referrals,
  loading,
  onApprove,
  onReject,
  onViewDetails,
  showActions = true,
  scope = 'admin',
  detailMode = 'link',
}) => {
  const { openReferralDetails } = useNavigation();
  if (loading) {
    return (
      <div className="card-navy p-10 text-center text-slate-500 text-sm">
        Chargement…
      </div>
    );
  }
  if (referrals.length === 0) {
    return (
      <div className="card-navy p-12 text-center">
        <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-600" />
        </div>
        <h4 className="text-slate-300 font-medium">Aucun parrainage</h4>
        <p className="text-slate-500 text-sm mt-1">Aucune donnée à afficher</p>
      </div>
    );
  }

  return (
    <div className="card-navy overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-navy-800/50 border-b border-navy-800">
            {scope === 'admin' && <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID</th>}
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Parrain</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidat</th>
            {scope === 'admin' && <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Projet</th>}
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statut</th>
            {scope === 'admin' && <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prime</th>}
            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
            {showActions && <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-800">
          {referrals.map((r) => (
            <tr key={r.id} className="hover:bg-navy-800/30 transition-colors">
                {scope === 'admin' && (
                  <td className="px-6 py-4 text-slate-400 text-xs font-mono">{r.id}</td>
                )}
                <td className="px-6 py-4 text-sm font-medium text-slate-200">{r.referrerName}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{r.candidateName}</td>
                {scope === 'admin' && (
                  <td className="px-6 py-4 text-sm text-slate-400">{r.projectName}</td>
                )}
                <td className="px-6 py-4">
                  <StatusBadge status={r.status as ReferralStatus} />
                </td>
                {scope === 'admin' && (
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {r.rewardAmount > 0 ? `${r.rewardAmount} €` : '—'}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-slate-400">{r.createdAt.toLocaleDateString('fr-FR')}</td>
                {showActions && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onViewDetails && (detailMode === 'modal' ? (
                        <button type="button" onClick={() => onViewDetails(r)} className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="Détails">
                          Détails
                        </button>
                      ) : (
                        <button type="button" onClick={() => openReferralDetails(r.id)} className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all text-sm font-medium">
                          Détails
                        </button>
                      ))}
                      {onApprove && r.status === 'SUBMITTED' && (
                        <button onClick={() => onApprove(r)} className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all text-sm">
                          Valider
                        </button>
                      )}
                      {onReject && r.status === 'SUBMITTED' && (
                        <button onClick={() => onReject(r)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-sm">
                          Rejeter
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
