import React, { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '../../../../frontend/app/providers/NavigationProvider';
import { AlertTriangle, Loader2, ThumbsUp, X as XIcon } from 'lucide-react';
import { ReferralService } from '../../services/ReferralService';
import type { Referral, ReferralHistoryEntry, ReferralStatus } from '../../models/Referral';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

const StatusBadge: React.FC<{ status: ReferralStatus }> = ({ status }) => {
  const styles: Record<ReferralStatus, string> = {
    SUBMITTED: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    APPROVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    REJECTED: 'bg-red-500/15 text-red-300 border-red-500/40',
    REWARDED: 'bg-purple-500/15 text-purple-200 border-purple-500/40',
  };

  const labels: Record<ReferralStatus, string> = {
    SUBMITTED: 'En attente',
    APPROVED: 'Validé',
    REJECTED: 'Rejeté',
    REWARDED: 'Prime versée',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const ConfirmModal: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  title,
  description,
  confirmLabel,
  tone = 'primary',
  busy,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const confirmClass =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : 'bg-soft-blue hover:bg-blue-600 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
        aria-label="Fermer"
        onClick={onCancel}
      />
      <div className="relative card-navy max-w-md w-full p-6 shadow-2xl border border-navy-800">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-500 hover:text-slate-200 hover:bg-navy-800"
            onClick={onCancel}
            aria-label="Fermer"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        {description && <p className="mt-3 text-sm text-slate-400 leading-relaxed">{description}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-navy-800 px-4 py-2 text-sm text-slate-300 hover:bg-navy-800/80"
            disabled={busy}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${confirmClass}`}
            disabled={busy}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast: React.FC<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }> = ({
  show,
  type,
  message,
}) => {
  if (!show) return null;
  const border =
    type === 'success' ? 'border-emerald-500' : type === 'error' ? 'border-red-500' : 'border-soft-blue';
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] card-navy px-4 py-3 border-l-4 ${border}`}>
      <div className="text-sm font-medium">{message}</div>
    </div>
  );
};

export const ReferralDetailsRH: React.FC = () => {
  const { selectedReferralId, setCurrentView } = useNavigation();
  const id = selectedReferralId ?? '';
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [history, setHistory] = useState<ReferralHistoryEntry[]>([]);

  const [mode, setMode] = useState<'none' | 'approve' | 'reject'>('none');
  const [rewardAmount, setRewardAmount] = useState('');
  const [rejectComment, setRejectComment] = useState('');

  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState<null | 'approve' | 'reject'>(null);

  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({
    show: false,
    type: 'success',
    message: '',
  });

  const actor = useMemo(() => {
    const label = user?.name ?? 'RH';
    const rid = user?.id ?? 'rh-1';
    return { id: rid, label };
  }, [user?.id, user?.name]);

  const canApprove = referral ? referral.status === 'SUBMITTED' || referral.status === 'APPROVED' : false;
  const canReject = referral ? referral.status === 'SUBMITTED' : false;

  const timeline = useMemo(() => {
    const sorted = history.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const submitted = sorted.find((h) => h.action === 'SUBMITTED');
    const statusHistory = sorted.filter((h) => h.action !== 'SUBMITTED');
    return { submitted, statusHistory };
  }, [history]);

  const refresh = () => {
    const rid = id ?? '';
    const nextReferral = rid ? ReferralService.getReferralById(rid) ?? null : null;
    setReferral(nextReferral);
    if (rid) {
      const all = ReferralService.getHistory().filter((h) => h.referralId === rid);
      setHistory(all);
    } else {
      setHistory([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      refresh();
      setLoading(false);
    }, 200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const suggestedReward = useMemo(() => {
    if (!id) return 500;
    return ReferralService.getSuggestedReward(id);
  }, [id, referral?.position]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ show: true, type, message });
    window.setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
  };

  const handleApproveClick = () => {
    if (!referral) return;
    const next = String(suggestedReward);
    setRewardAmount(next);
    setRejectComment('');
    setMode('approve');
  };

  const handleRejectClick = () => {
    setRejectComment('');
    setRewardAmount('');
    setMode('reject');
  };

  const handleConfirm = async () => {
    if (!id || !referral || busy) return;
    setBusy(true);
    try {
      if (confirmOpen === 'approve') {
        const amount = Number(rewardAmount.replace(',', '.'));
        if (!Number.isFinite(amount) || amount <= 0) {
          showToast('error', 'Montant de prime invalide.');
          setBusy(false);
          setConfirmOpen(null);
          return;
        }

        // Step 1: validate (APPROVED)
        ReferralService.updateStatus(id, 'APPROVED', actor);
        // Step 2: assign reward (REWARDED)
        const updated = ReferralService.assignReward(id, amount, actor);
        if (!updated) throw new Error('Échec de l’attribution de la prime.');

        showToast('success', 'Parrainage validé et prime attribuée.');
        setMode('none');
        setConfirmOpen(null);
        refresh();
        return;
      }

      if (confirmOpen === 'reject') {
        ReferralService.updateStatus(id, 'REJECTED', actor, rejectComment || undefined);
        showToast('success', 'Décision enregistrée (rejet).');
        setMode('none');
        setConfirmOpen(null);
        refresh();
      }
    } catch {
      showToast('error', 'Action impossible. Réessayez.');
      setConfirmOpen(null);
    } finally {
      setBusy(false);
    }
  };

  const unauthorized = user?.role !== 'RH';

  return (
    <>
      <section className="flex-1 min-w-0 space-y-6">
        <Toast show={toast.show} type={toast.type} message={toast.message} />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-50">Décision RH</h1>
              <p className="text-sm text-slate-500 mt-1">Validation uniquement depuis l'écran de détail.</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={referral?.status ?? 'SUBMITTED'} />
              <button type="button" onClick={() => setCurrentView('rh-management')} className="text-sm text-soft-blue hover:underline font-medium">
                ← Retour
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-navy p-10 text-center text-slate-500 text-sm">Chargement du dossier…</div>
        ) : !referral ? (
          <div className="card-navy p-10 text-center text-slate-400 text-sm">
            Parrainage introuvable.
          </div>
        ) : (
          <div className="space-y-6">
            {unauthorized && (
              <div className="card-navy p-5 border-red-500/30 text-red-200">
                Accès refusé. Seule la RH peut valider des dossiers.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-navy p-5 md:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold text-slate-200">Candidat</h2>
                  <span className="text-xs text-slate-500 font-mono">{referral.id}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Nom</span>
                    <span className="text-slate-200 text-right font-medium">{referral.candidateName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">E-mail</span>
                    <span className="text-slate-200 text-right break-all">{referral.candidateEmail}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Téléphone</span>
                    <span className="text-slate-200 text-right break-all">{referral.candidatePhone}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Poste</span>
                    <span className="text-slate-200 text-right font-medium">{referral.position}</span>
                  </div>
                </div>
              </div>

              <div className="card-navy p-5 md:p-6 space-y-4">
                <h2 className="text-sm font-semibold text-slate-200">Parrain</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Nom</span>
                    <span className="text-slate-200 text-right font-medium">{referral.referrerName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Équipe</span>
                    <span className="text-slate-200 text-right">{referral.teamId}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Projet</span>
                    <span className="text-slate-200 text-right">{referral.projectName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="card-navy p-5 md:p-6 xl:col-span-2 space-y-4">
                <h2 className="text-sm font-semibold text-slate-200">Visualisation du CV</h2>
                {referral.cvUrl ? (
                  <iframe
                    title="CV du candidat"
                    src={referral.cvUrl}
                    className="w-full rounded-lg border border-navy-800"
                    style={{ height: 420 }}
                  />
                ) : (
                  <div className="rounded-lg border border-navy-800 bg-navy-900/50 p-10 text-center">
                    <p className="text-sm font-medium text-slate-300">Aucun CV téléchargé</p>
                    <p className="text-xs text-slate-500 mt-2">Veuillez vérifier le dossier RH avant décision.</p>
                  </div>
                )}
              </div>

              <div className="card-navy p-5 md:p-6 space-y-4">
                <h2 className="text-sm font-semibold text-slate-200">Chronologie</h2>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Date de soumission</div>
                    <div className="text-slate-200 mt-1 font-medium">
                      {referral.createdAt.toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {timeline.statusHistory.length === 0 ? (
                      <p className="text-xs text-slate-500">Pas encore d'historique RH.</p>
                    ) : (
                      timeline.statusHistory.map((h) => (
                        <div key={h.id} className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={h.action === 'APPROVED' ? 'APPROVED' : h.action === 'REJECTED' ? 'REJECTED' : 'REWARDED'} />
                              <span className="text-sm font-medium text-slate-200">
                                {h.action === 'APPROVED' ? 'Validé' : h.action === 'REJECTED' ? 'Rejeté' : 'Prime versée'}
                              </span>
                            </div>
                            {h.comment && <p className="text-xs text-slate-500 mt-1">Commentaire : {h.comment}</p>}
                            {typeof h.rewardAmount === 'number' && (
                              <p className="text-xs text-purple-200 mt-1">Prime : {h.rewardAmount} €</p>
                            )}
                          </div>
                          <div className="text-right text-xs text-slate-500 whitespace-nowrap">
                            {h.createdAt.toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-navy p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-200">Décision</h2>
                {referral.status === 'REWARDED' && (
                  <span className="text-xs text-purple-200">Prime: {referral.rewardAmount} €</span>
                )}
                {referral.status === 'REJECTED' && (
                  <span className="text-xs text-red-300 inline-flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Rejeté
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleApproveClick}
                  disabled={!canApprove || busy || unauthorized}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600"
                >
                  Valider
                </button>
                <button
                  type="button"
                  onClick={handleRejectClick}
                  disabled={!canReject || busy || unauthorized}
                  className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Rejeter
                </button>
              </div>

              {mode === 'approve' && canApprove && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5">
                      Montant de la prime (€)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-navy-800 bg-navy-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-soft-blue"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      placeholder={String(suggestedReward)}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Montant suggéré : {suggestedReward} € (selon les règles)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmOpen('approve')}
                    disabled={busy || unauthorized}
                    className="rounded-lg bg-soft-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    Valider et attribuer la prime
                  </button>
                </div>
              )}

              {mode === 'reject' && canReject && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5">
                      Commentaire (facultatif)
                    </label>
                    <textarea
                      className="w-full min-h-[90px] rounded-lg border border-navy-800 bg-navy-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-soft-blue"
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Motif du refus…"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen('reject')}
                    disabled={busy || unauthorized}
                    className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                </div>
              )}

              {(referral.status === 'REWARDED' || referral.status === 'REJECTED') && (
                <p className="text-xs text-slate-500">
                  Décision finale enregistrée. Les actions sont désactivées.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <ConfirmModal
        open={confirmOpen === 'approve'}
        title="Confirmer la validation et la prime"
        description={`Candidat : ${referral?.candidateName ?? ''}. La prime sera fixée à ${rewardAmount || '—'} €.`}
        confirmLabel="Confirmer"
        tone="primary"
        busy={busy}
        onCancel={() => setConfirmOpen(null)}
        onConfirm={handleConfirm}
      />
      <ConfirmModal
        open={confirmOpen === 'reject'}
        title="Confirmer le refus"
        description={`Candidat : ${referral?.candidateName ?? ''}. Le statut passera à « Rejeté ».`}
        confirmLabel="Confirmer"
        tone="danger"
        busy={busy}
        onCancel={() => setConfirmOpen(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

