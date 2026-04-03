import React, { useState } from 'react';
import { X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Referral, ReferralStatus } from '../models/Referral';

interface ReferralDetailsModalProps {
  referral: Referral | null;
  open: boolean;
  onClose: () => void;
  /** When true, shows an optional comment field (UI only, no persist). Used for PM scope. */
  showCommentField?: boolean;
}

export const ReferralDetailsModal: React.FC<ReferralDetailsModalProps> = ({
  referral,
  open,
  onClose,
  showCommentField = false,
}) => {
  const [comment, setComment] = useState('');

  if (!open) return null;
  if (!referral) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="relative card-navy max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-navy-800">
        <div className="sticky top-0 flex items-start justify-between gap-4 p-4 border-b border-navy-800 bg-navy-900">
          <h3 className="text-lg font-semibold text-slate-50">Détails du parrainage</h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 hover:text-slate-200 hover:bg-navy-800"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">{referral.id}</span>
            <StatusBadge status={referral.status as ReferralStatus} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidat</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-slate-500">Nom:</span> <span className="text-slate-200">{referral.candidateName}</span></p>
                <p><span className="text-slate-500">E-mail :</span> <span className="text-slate-200 break-all">{referral.candidateEmail}</span></p>
                <p><span className="text-slate-500">Tél:</span> <span className="text-slate-200">{referral.candidatePhone}</span></p>
                <p><span className="text-slate-500">Poste:</span> <span className="text-slate-200">{referral.position}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parrain</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-slate-500">Nom:</span> <span className="text-slate-200">{referral.referrerName}</span></p>
                <p><span className="text-slate-500">Projet:</span> <span className="text-slate-200">{referral.projectName}</span></p>
                <p><span className="text-slate-500">Équipe:</span> <span className="text-slate-200">{referral.teamId}</span></p>
                {referral.rewardAmount > 0 && (
                  <p><span className="text-slate-500">Prime:</span> <span className="text-slate-200">{referral.rewardAmount} €</span></p>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            Date de soumission: {referral.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          {showCommentField && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Commentaire (non enregistré)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajouter un commentaire…"
                className="w-full min-h-[80px] rounded-lg border border-navy-800 bg-navy-900 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
