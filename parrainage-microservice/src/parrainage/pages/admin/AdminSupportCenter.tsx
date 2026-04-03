import React, { useMemo, useState } from 'react';
import { Search, AlertTriangle, Bug, Wrench, Check, X, Pencil, Copy } from 'lucide-react';
import { ReferralService } from '@parrainage/core/services/ReferralService';
import { AdminService } from '@parrainage/core/services/AdminService';
import type { Referral, ReferralStatus } from '@parrainage/core/models/Referral';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { AccessDenied } from '../../components/AccessDenied';

type DebugTab = 'referral' | 'config' | 'logs';

export const AdminSupportCenter: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [debugTab, setDebugTab] = useState<DebugTab>('referral');
  const [selectedJson, setSelectedJson] = useState<Referral | null>(null);
  const [editOpen, setEditOpen] = useState<Referral | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Referral>>({});
  const [, refreshTick] = useState(0);
  const refresh = () => refreshTick((n) => n + 1);

  if (user?.role !== 'ADMIN') {
    return (
      <AccessDenied
        message="Cette page est réservée au rôle Admin."
        backTo={
          user?.role === 'RH'
            ? { to: '/parrainage/rh/dashboard', label: 'Retour au tableau de bord RH' }
            : { to: '/parrainage/pilote/dashboard', label: 'Retour' }
        }
      />
    );
  }

  const referrals = ReferralService.getAllReferrals();
  const anomalies = useMemo(() => ReferralService.detectAnomalies(), [referrals.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return referrals;
    return referrals.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.candidateName.toLowerCase().includes(q) ||
        r.candidateEmail.toLowerCase().includes(q) ||
        r.referrerName.toLowerCase().includes(q),
    );
  }, [referrals, query]);

  const actor = { id: user?.id ?? 'admin-1', label: user?.name ?? 'Support technique' };

  const openEdit = (r: Referral) => {
    setEditDraft({
      candidateName: r.candidateName,
      candidateEmail: r.candidateEmail,
      candidatePhone: r.candidatePhone,
      position: r.position,
      projectName: r.projectName,
      status: r.status,
      rewardAmount: r.rewardAmount,
    });
    setEditOpen(r);
  };

  const saveEdit = () => {
    if (!editOpen) return;
    ReferralService.updateReferralManual(
      editOpen.id,
      {
        candidateName: editDraft.candidateName,
        candidateEmail: editDraft.candidateEmail,
        candidatePhone: editDraft.candidatePhone,
        position: editDraft.position,
        projectName: editDraft.projectName,
        status: editDraft.status as ReferralStatus,
        rewardAmount: editDraft.rewardAmount,
      },
      actor,
    );
    setEditOpen(null);
    refresh();
  };

  const copyExport = () => {
    void navigator.clipboard.writeText(ReferralService.exportDataSnapshot());
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
          <Wrench className="w-7 h-7 text-blue-500 shrink-0" />
          Outils administrateur
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Recherche de parrainages, actions rapides, anomalies et débogage (données locales).
        </p>
      </div>

      {(anomalies.duplicateCandidates.length > 0 || anomalies.suspiciousEmails.length > 0) && (
        <div className="card-navy border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-amber-200 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            Anomalies détectées
          </div>
          <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
            {anomalies.duplicateCandidates.map((d) => (
              <li key={d.email}>
                Candidat en doublon (même e-mail) : <span className="font-mono text-amber-100">{d.email}</span> —{' '}
                {d.referrals.length} dossiers
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-navy p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, e-mail, ID parrainage…"
            className="w-full bg-navy-900 border border-navy-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/50 border-b border-navy-800">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidat</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">E-mail</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-navy-800/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{r.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-200">{r.candidateName}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{r.candidateEmail}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap gap-1 justify-end">
                      <button
                        type="button"
                        title="Afficher le JSON"
                        className="p-2 rounded-lg text-slate-400 hover:bg-navy-800 hover:text-blue-400"
                        onClick={() => setSelectedJson(r)}
                      >
                        <Bug className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Forcer la validation"
                        className="p-2 rounded-lg text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                        onClick={() => {
                          ReferralService.forceApprove(r.id, actor);
                          refresh();
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Forcer le refus"
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => {
                          ReferralService.forceReject(r.id, actor);
                          refresh();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Éditer"
                        className="p-2 rounded-lg text-slate-400 hover:bg-blue-500/10 hover:text-blue-400"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-navy overflow-hidden">
        <div className="flex border-b border-navy-800">
          {(['referral', 'config', 'logs'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setDebugTab(t)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                debugTab === t ? 'bg-navy-800/50 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {t === 'referral' && 'JSON parrainage (sélection)'}
              {t === 'config' && 'Config système'}
              {t === 'logs' && 'Journaux et audit'}
            </button>
          ))}
          <button
            type="button"
            onClick={copyExport}
            className="ml-auto px-4 py-3 text-sm text-slate-400 hover:text-white flex items-center gap-1"
          >
            <Copy className="w-4 h-4" />
            Copier export complet
          </button>
        </div>
        <div className="p-4 max-h-[420px] overflow-auto">
          <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap break-all">
            {debugTab === 'referral' &&
              (selectedJson ? JSON.stringify(selectedJson, null, 2) : 'Sélectionnez une ligne (icône bug) ou choisissez un ID dans le tableau.')}
            {debugTab === 'config' && JSON.stringify(AdminService.getSystemConfig(), null, 2)}
            {debugTab === 'logs' &&
              JSON.stringify(
                {
                  historySample: ReferralService.getHistory().slice(0, 40),
                  audit: AdminService.getAuditLog().slice(0, 40),
                },
                null,
                2,
              )}
          </pre>
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" aria-label="Fermer" onClick={() => setEditOpen(null)} />
          <div className="relative card-navy max-w-lg w-full p-6 border border-navy-800 shadow-2xl z-[61]">
            <h3 className="text-lg font-semibold text-white mb-4">Édition manuelle — {editOpen.id}</h3>
            <div className="grid gap-3">
              {(
                [
                  ['candidateName', 'Nom du candidat'],
                  ['candidateEmail', 'E-mail du candidat'],
                  ['candidatePhone', 'Téléphone'],
                  ['position', 'Poste'],
                  ['projectName', 'Projet'],
                ] as const
              ).map(([field, labelFr]) => (
                <div key={field}>
                  <label className="text-xs font-bold text-slate-500 uppercase">{labelFr}</label>
                  <input
                    className="w-full mt-1 bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                    value={(editDraft[field] as string) ?? ''}
                    onChange={(e) => setEditDraft((d) => ({ ...d, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Statut</label>
                <select
                  className="w-full mt-1 bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white"
                  value={editDraft.status ?? editOpen.status}
                  onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value as ReferralStatus }))}
                >
                  {(
                    [
                      ['SUBMITTED', 'En attente'],
                      ['APPROVED', 'Validé'],
                      ['REJECTED', 'Rejeté'],
                      ['REWARDED', 'Prime versée'],
                    ] as const
                  ).map(([s, label]) => (
                    <option key={s} value={s}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Montant récompense (€)</label>
                <input
                  type="number"
                  className="w-full mt-1 bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white"
                  value={editDraft.rewardAmount ?? 0}
                  onChange={(e) => setEditDraft((d) => ({ ...d, rewardAmount: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 rounded-lg border border-navy-800 text-slate-300 hover:bg-navy-800" onClick={() => setEditOpen(null)}>
                Annuler
              </button>
              <button type="button" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500" onClick={saveEdit}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
