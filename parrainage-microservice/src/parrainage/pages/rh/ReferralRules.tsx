import React, { useEffect, useMemo, useState } from 'react';
import { ReferralService } from '../../services/ReferralService';
import type { ReferralRule, ReferralRuleStatus, ReferralRuleType } from '../../models/Referral';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

const StatusBadge: React.FC<{ status: ReferralRuleStatus }> = ({ status }) => {
  const cls =
    status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status === 'ACTIVE' ? 'Actif' : 'En pause'}
    </span>
  );
};

export const ReferralRules: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<ReferralRule[]>([]);
  const { user } = useAuth();
  const unauthorized = user?.role !== 'RH';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<ReferralRuleType>('REWARD_PER_POSITION');
  const [target, setTarget] = useState('');
  const [value, setValue] = useState<string>(''); // store as string for input control
  const [status, setStatus] = useState<ReferralRuleStatus>('ACTIVE');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const refresh = () => {
    setRules(ReferralService.getRules());
  };

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      refresh();
      setLoading(false);
    }, 200);
    return () => window.clearTimeout(t);
  }, []);

  const canSubmit = useMemo(() => {
    const v = Number(value.replace(',', '.'));
    if (!name.trim()) return false;
    if (!Number.isFinite(v) || v <= 0) return false;
    if (type === 'REWARD_PER_POSITION' && !target.trim()) return false;
    return true;
  }, [name, value, target, type]);

  const submit = () => {
    const v = Number(value.replace(',', '.'));
    const rule = {
      id: editingId ?? undefined,
      name: name.trim(),
      type,
      value: v,
      target: type === 'REWARD_PER_POSITION' ? target.trim() : undefined,
      status,
    };

    const saved = ReferralService.upsertRule(rule);
    setEditingId(saved.id);
    setStatus(saved.status);
    setName(saved.name);
    setType(saved.type);
    setTarget(saved.target ?? '');
    setValue(String(saved.value));
    refresh();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setType('REWARD_PER_POSITION');
    setTarget('');
    setValue('');
    setStatus('ACTIVE');
  };

  const startEdit = (r: ReferralRule) => {
    setEditingId(r.id);
    setName(r.name);
    setType(r.type);
    setTarget(r.target ?? '');
    setValue(String(r.value));
    setStatus(r.status);
    setDeleteTargetId(null);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    ReferralService.deleteRule(deleteTargetId);
    setDeleteTargetId(null);
    refresh();
    if (editingId === deleteTargetId) resetForm();
  };

  return (
    <>
      <section className="flex-1 min-w-0 space-y-6">
        {unauthorized ? (
          <div className="card-navy p-10 text-center text-red-200 text-sm">
            Accès refusé. Réservé à la RH.
          </div>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Règles de parrainage</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les règles métier (hors configuration système).</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="card-navy p-5 md:p-6 xl:col-span-1 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">
              {editingId ? 'Modifier la règle' : 'Créer une règle'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                  Intitulé de la règle
                </label>
                <input
                  className="w-full rounded-lg border border-navy-800 bg-navy-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. : Prime par poste — Développeur"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                    Type
                  </label>
                  <select
                    className="w-full rounded-lg border border-navy-800 bg-navy-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                    value={type}
                    onChange={(e) => setType(e.target.value as ReferralRuleType)}
                  >
                    <option value="REWARD_PER_POSITION">Prime selon le poste</option>
                    <option value="REWARD_AFTER_PROBATION">Prime après période d’essai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                    Statut
                  </label>
                  <select
                    className="w-full rounded-lg border border-navy-800 bg-navy-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ReferralRuleStatus)}
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="PAUSED">En pause</option>
                  </select>
                </div>
              </div>

              {type === 'REWARD_PER_POSITION' ? (
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                    Poste cible
                  </label>
                  <input
                    className="w-full rounded-lg border border-navy-800 bg-navy-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Ex. : Développeur"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">
                  Montant (€)
                </label>
                <input
                  className="w-full rounded-lg border border-navy-800 bg-navy-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ex. : 600"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="flex-1 min-w-[160px] rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {editingId ? 'Enregistrer les modifications' : 'Créer la règle'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 min-w-[160px] rounded-lg border border-navy-800 px-4 py-2 text-sm text-slate-300 hover:bg-navy-800/80"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="card-navy p-5 md:p-6 xl:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Règles</h2>

            {loading ? (
              <div className="text-sm text-slate-500 py-10 text-center">Chargement…</div>
            ) : rules.length === 0 ? (
              <div className="text-sm text-slate-400 py-10 text-center">Aucune règle.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-navy-800/50 border-b border-navy-800">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Intitulé</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800">
                    {rules.map((r) => (
                      <tr key={r.id} className="hover:bg-navy-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-200 whitespace-nowrap">{r.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                          {r.type === 'REWARD_PER_POSITION' ? 'Prime selon le poste' : 'Prime après période d’essai'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                          {r.type === 'REWARD_PER_POSITION' && r.target ? `${r.value} € (${r.target})` : `${r.value} €`}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(r)}
                              className="text-xs text-blue-500 hover:underline font-medium"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(r.id)}
                              className="text-xs text-red-300 hover:underline font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div />
      </section>

      <ConfirmModal
        open={!!deleteTargetId}
        title="Supprimer cette règle ?"
        description="Cette action est définitive. La règle ne sera plus utilisée pour suggérer les montants de prime."
        confirmLabel="Supprimer"
        tone="danger"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

const ConfirmModal: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, description, confirmLabel, tone = 'primary', onConfirm, onCancel }) => {
  const busy = false;
  if (!open) return null;

  const confirmClass =
    tone === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white';

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
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

