import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/AdminService';
import type { ReferralBonusTier, ReferralProgramMode, SystemConfig } from '../../models/SystemConfig';
import { DEFAULT_REFERRAL_PROGRAM_RULES, nextTierId } from '@parrainage/core/utils/referralProgram';
import { AccessDenied } from '../../components/AccessDenied';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { AuditAccessSection } from './AuditAccessSection';

const ACTIONS = ['Validate', 'Reject', 'Approve', 'Archive'] as const;
const ROLE_DETAILS: Record<string, string> = {
  Coach: 'Premier niveau de validation après soumission Pilote.',
  Manager: "Validation managériale de l'étape équipe.",
  RP: 'Arbitrage projet avant la décision finale.',
  RH: 'Validation finale obligatoire et archivage.',
};

const inputClass =
  'w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50';

function TierEditorBlock({
  title,
  description,
  tiers,
  onChange,
}: {
  title: string;
  description: string;
  tiers: ReferralBonusTier[];
  onChange: (next: ReferralBonusTier[]) => void;
}) {
  const update = (id: string, field: 'amountDH' | 'afterMonths', v: number) => {
    onChange(tiers.map((t) => (t.id === id ? { ...t, [field]: v } : t)));
  };
  const remove = (id: string) => {
    if (tiers.length <= 1) return;
    onChange(tiers.filter((t) => t.id !== id));
  };
  const add = () => onChange([...tiers, { id: nextTierId(), amountDH: 0, afterMonths: 1 }]);

  return (
    <div className="card-navy p-4 md:p-5 space-y-3 border border-navy-800/80">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="space-y-2">
        {tiers.map((t, idx) => (
          <div
            key={t.id}
            className="flex flex-wrap items-end gap-3 rounded-lg border border-navy-800 bg-navy-900/50 p-3"
          >
            <span className="text-[11px] uppercase tracking-wide text-slate-500 w-full sm:w-20 shrink-0 pt-2">
              Tranche {idx + 1}
            </span>
            <label className="flex-1 min-w-[120px] text-xs text-slate-400">
              Montant (DH)
              <input
                type="number"
                min={0}
                value={t.amountDH}
                onChange={(e) => update(t.id, 'amountDH', Number(e.target.value) || 0)}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="flex-1 min-w-[120px] text-xs text-slate-400">
              Après (mois)
              <input
                type="number"
                min={0}
                value={t.afterMonths}
                onChange={(e) => update(t.id, 'afterMonths', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <button
              type="button"
              disabled={tiers.length <= 1}
              onClick={() => remove(t.id)}
              className="text-xs text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-2"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="text-xs font-medium text-soft-blue hover:underline">
        Ajouter une tranche
      </button>
    </div>
  );
}

export const AdminSystemConfig: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SystemConfig>(() => AdminService.getSystemConfig());
  const [saved, setSaved] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<'config' | 'details' | null>(null);

  /** RH et Administrateur : seuls profils métier autorisés à éditer la config système (lien menu + rendu). */
  const isAllowed = user?.role === 'RH' || user?.role === 'ADMIN';

  useEffect(() => {
    const loaded = AdminService.getSystemConfig();
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- debug chargement config (tiers / modes)
      console.log('CONFIG LOADED:', loaded);
    }
    setConfig(loaded);
  }, [user?.role, user?.id]);

  const handleSave = () => {
    const payload: SystemConfig = {
      ...config,
      referralProgramRules: config.referralProgramRules ?? DEFAULT_REFERRAL_PROGRAM_RULES,
    };
    const next = AdminService.updateSystemConfig(payload, {
      id: user?.id ?? 'admin-1',
      label: user?.name ?? (user?.role === 'ADMIN' ? 'Administrateur' : 'RH'),
      role: user?.role,
    });
    setConfig(next);
    window.dispatchEvent(new CustomEvent('parrainage:system-config-updated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isAllowed) {
    return (
      <AccessDenied
        message="Accès refusé. La configuration système est réservée aux rôles RH et Administrateur."
        backTo={
          user?.role === 'MANAGER' || user?.role === 'COACH'
            ? { to: '/parrainage/pm/dashboard', label: 'Retour au tableau de bord équipe' }
            : { to: '/dashboard', label: 'Retour' }
        }
      />
    );
  }

  const workflow = config.adminWorkflow!;
  const moveStep = (index: number, direction: -1 | 1) => {
    const curr = workflow.steps[index];
    if (!curr || curr.role === 'RH') return;
    const target = index + direction;
    if (target < 0 || target >= workflow.steps.length || workflow.steps[target].role === 'RH') return;
    const next = [...workflow.steps];
    [next[index], next[target]] = [next[target], next[index]];
    setConfig({ ...config, adminWorkflow: { ...workflow, steps: next } });
  };
  const selectedIndex = workflow.steps.findIndex((s) => s.id === selectedStepId);
  const selectedStep = selectedIndex >= 0 ? workflow.steps[selectedIndex] : null;

  const rules = config.referralProgramRules ?? DEFAULT_REFERRAL_PROGRAM_RULES;
  const setProgramMode = (activeMode: ReferralProgramMode) => {
    setConfig({
      ...config,
      referralProgramRules: { ...rules, activeMode },
    });
  };
  const patchRules = (partial: Partial<typeof rules>) => {
    setConfig({ ...config, referralProgramRules: { ...rules, ...partial } });
  };

  return (
    <section className="flex-1 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Configuration système</h1>
        <p className="text-sm text-slate-500 mt-1">
          {user?.role === 'RH'
            ? 'Règles de primes (modes dynamiques), plafonds et workflow de validation.'
            : 'Règles de primes, workflow, audit et paramètres système.'}
        </p>
      </div>

      <div className="card-navy p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Règles de parrainage — primes (DH)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Deux jeux de règles coexistent : le <strong className="text-slate-400">mode standard</strong> (par défaut)
              et le <strong className="text-slate-400">mode période critique</strong>. Vous basculez le mode actif à tout
              moment ; les tranches de chaque mode restent éditables ci-dessous.
            </p>
          </div>

          <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-slate-300">
            <span className="font-semibold text-amber-200/90">Mode appliqué actuellement : </span>
            {rules.activeMode === 'STANDARD' ? (
              <>Standard — somme des tranches standard (après enregistrement).</>
            ) : (
              <>Période critique — somme des tranches « critique » (après enregistrement).</>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setProgramMode('STANDARD')}
              className={`rounded-xl border p-4 text-left transition-colors ${
                rules.activeMode === 'STANDARD'
                  ? 'border-blue-500/50 bg-blue-600/10 ring-1 ring-blue-500/30'
                  : 'border-navy-800 bg-navy-900/40 hover:border-navy-700'
              }`}
            >
              <span className="text-sm font-semibold text-slate-50">Mode STANDARD</span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ex. une tranche : 1&nbsp;500&nbsp;DH après 6&nbsp;mois. Ajoutez d’autres tranches si besoin.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setProgramMode('CRITICAL_PERIOD')}
              className={`rounded-xl border p-4 text-left transition-colors ${
                rules.activeMode === 'CRITICAL_PERIOD'
                  ? 'border-rose-500/40 bg-rose-500/10 ring-1 ring-rose-500/25'
                  : 'border-navy-800 bg-navy-900/40 hover:border-navy-700'
              }`}
            >
              <span className="text-sm font-semibold text-slate-50">Mode PÉRIODE CRITIQUE</span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ex. 500&nbsp;DH à 3&nbsp;mois puis 1&nbsp;000&nbsp;DH à 6&nbsp;mois — configurable.
              </p>
            </button>
          </div>

          <TierEditorBlock
            title="Tranches — mode standard"
            description="Utilisées lorsque le mode standard est actif. Les montants s’additionnent selon les délais atteints."
            tiers={rules.standardTiers}
            onChange={(standardTiers) => patchRules({ standardTiers })}
          />
          <TierEditorBlock
            title="Tranches — période critique"
            description="Utilisées lorsque la période critique est active (ex. recrutement urgent)."
            tiers={rules.criticalPeriodTiers}
            onChange={(criticalPeriodTiers) => patchRules({ criticalPeriodTiers })}
          />

          <p className="text-[11px] text-slate-500">
            Les champs techniques « prime par défaut » et « durée min. » sont dérivés automatiquement du mode actif pour
            compatibilité avec les autres écrans (valeurs actuelles : {config.defaultBonusAmount}&nbsp;DH cumulés, premier
            palier à {config.minDurationMonths}&nbsp;mois).
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Limite de parrainages par employé
          </label>
          <input
            type="number"
            value={config.referralLimitPerEmployee}
            onChange={(e) =>
              setConfig({
                ...config,
                referralLimitPerEmployee: Number(e.target.value) || 0,
              })
            }
            className="w-full bg-navy-900 border border-navy-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        {user?.role !== 'RH' && (
          <div className="border border-navy-800 rounded-xl p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Workflow de validation</h2>
            <div className="space-y-3">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="rounded-lg border border-navy-800 p-3 bg-navy-900/40">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-100 font-medium">{index + 1}. {step.role}</div>
                    <div className="flex gap-2">
                      <button type="button" disabled={step.role === 'RH'} onClick={() => moveStep(index, -1)} className="px-2 py-1 rounded bg-navy-800 text-slate-300 disabled:opacity-40">↑</button>
                      <button type="button" disabled={step.role === 'RH'} onClick={() => moveStep(index, 1)} className="px-2 py-1 rounded bg-navy-800 text-slate-300 disabled:opacity-40">↓</button>
                      <button type="button" onClick={() => { setSelectedStepId(step.id); setPanelMode('config'); }} className="px-2 py-1 rounded bg-navy-800 text-slate-300">Configurer</button>
                      <button type="button" onClick={() => { setSelectedStepId(step.id); setPanelMode('details'); }} className="px-2 py-1 rounded bg-navy-800 text-slate-300">Voir détails</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {user?.role !== 'RH' && <AuditAccessSection config={config} setConfig={setConfig} />}

        <div className="flex justify-end gap-3">
          {saved && (
            <span className="text-sm text-emerald-400 self-center">Enregistré</span>
          )}
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>

      {user?.role !== 'RH' && panelMode && selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setPanelMode(null)} />
          <div className="relative card-navy max-w-xl w-full p-6 border border-navy-800">
            {panelMode === 'config' ? (
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold">Configurer: {selectedStep.role}</h3>
                <label className="text-slate-300 text-sm">Rôle
                  <input readOnly value={selectedStep.role} className="mt-1 w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white" />
                </label>
                <label className="text-slate-300 text-sm">SLA spécifique (h)
                  <input type="number" min={0} value={selectedStep.slaHours} onChange={(e) => setConfig({ ...config, adminWorkflow: { ...workflow, steps: workflow.steps.map((s, i) => i === selectedIndex ? { ...s, slaHours: Number(e.target.value) || 0 } : s) } })} className="mt-1 w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white" />
                </label>
                <div className="flex flex-wrap gap-3">
                  {ACTIONS.map((a) => (
                    <label key={a} className="text-xs text-slate-300 flex items-center gap-2">
                      <input type="checkbox" checked={selectedStep.actions.includes(a)} onChange={(e) => {
                        const nextActions = e.target.checked ? [...new Set([...selectedStep.actions, a])] : selectedStep.actions.filter((x) => x !== a);
                        setConfig({ ...config, adminWorkflow: { ...workflow, steps: workflow.steps.map((s, i) => i === selectedIndex ? { ...s, actions: nextActions } : s) } });
                      }} />
                      {a}
                    </label>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="text-slate-300 text-sm flex items-center gap-2"><input type="checkbox" checked={selectedStep.notificationEnabled} onChange={(e) => setConfig({ ...config, adminWorkflow: { ...workflow, steps: workflow.steps.map((s, i) => i === selectedIndex ? { ...s, notificationEnabled: e.target.checked } : s) } })} />Notifications actives</label>
                  <label className="text-slate-300 text-sm">Type
                    <select value={selectedStep.notificationType} onChange={(e) => setConfig({ ...config, adminWorkflow: { ...workflow, steps: workflow.steps.map((s, i) => i === selectedIndex ? { ...s, notificationType: e.target.value as 'email' | 'in-app' } : s) } })} className="mt-1 w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white">
                      <option value="email">Email</option>
                      <option value="in-app">InApp</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-white text-lg font-semibold">Détails: {selectedStep.role}</h3>
                <p className="text-slate-300 text-sm">{ROLE_DETAILS[selectedStep.role] ?? 'Étape de workflow.'}</p>
                <p className="text-slate-400 text-sm">Hiérarchie: Pilote → Coach → Manager → RP → RH</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
