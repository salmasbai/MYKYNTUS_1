import { useEffect, useMemo, useState } from 'react';
import type { SystemConfig, WorkflowAction } from '../../../modules/parrainage/core/models/SystemConfig';

const ACTIONS: WorkflowAction[] = ['Validate', 'Reject', 'Approve', 'Archive'];
const ROLE_DETAILS: Record<string, string> = {
  Coach: 'Premier niveau de validation après soumission Pilote.',
  Manager: "Validation managériale de l'étape équipe.",
  RP: 'Arbitrage projet avant la décision finale.',
  RH: 'Validation finale obligatoire et archivage.',
};

interface Props {
  config: SystemConfig;
  onChange: (next: SystemConfig) => void;
  onSave: () => void;
  saving?: boolean;
}

export const WorkflowAdmin: React.FC<Props> = ({ config, onChange, onSave, saving = false }) => {
  const workflow = config.adminWorkflow!;
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [mode, setMode] = useState<'config' | 'details' | null>(null);
  const [globalSla, setGlobalSla] = useState(48);
  const [globalNotifications, setGlobalNotifications] = useState(true);

  useEffect(() => {
    const avg = workflow.steps.length ? Math.round(workflow.steps.reduce((a, s) => a + s.slaHours, 0) / workflow.steps.length) : 48;
    setGlobalSla(avg);
    setGlobalNotifications(workflow.steps.some((s) => s.notificationEnabled));
  }, [workflow.steps]);

  const stepIndex = useMemo(() => {
    if (!selectedStepId) return -1;
    return workflow.steps.findIndex((s) => s.id === selectedStepId);
  }, [workflow.steps, selectedStepId]);
  const selectedStep = stepIndex >= 0 ? workflow.steps[stepIndex] : null;

  const moveStep = (index: number, direction: -1 | 1) => {
    const curr = workflow.steps[index];
    if (!curr || curr.role === 'RH') return;
    const target = index + direction;
    if (target < 0 || target >= workflow.steps.length || workflow.steps[target].role === 'RH') return;
    const next = [...workflow.steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...config, adminWorkflow: { ...workflow, steps: next } });
  };

  return (
    <section className="flex-1 space-y-6 max-w-5xl">
      <div className="card-navy p-6 space-y-6">
        <div className="space-y-3">
          {workflow.steps.map((step, index) => (
            <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-800 bg-navy-900/40">
              <span className="text-slate-200">{index + 1}. {step.role}</span>
              <div className="flex gap-2 items-center">
                <button onClick={() => moveStep(index, -1)} disabled={step.role === 'RH'} className="px-2 py-1 rounded bg-navy-800 text-slate-300 disabled:opacity-40">↑</button>
                <button onClick={() => moveStep(index, 1)} disabled={step.role === 'RH'} className="px-2 py-1 rounded bg-navy-800 text-slate-300 disabled:opacity-40">↓</button>
                <button onClick={() => { setSelectedStepId(step.id); setMode('config'); }} className="px-2 py-1 rounded bg-navy-800 text-slate-300">Modifier</button>
                <button onClick={() => { setSelectedStepId(step.id); setMode('details'); }} className="px-2 py-1 rounded bg-navy-800 text-slate-300">Détails</button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-slate-300 text-sm">SLA global (heures)
            <input type="number" min={0} value={globalSla} onChange={(e) => setGlobalSla(Number(e.target.value) || 0)} className="mt-1 w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-slate-300 text-sm flex items-center gap-2 mt-7">
            <input type="checkbox" checked={globalNotifications} onChange={(e) => setGlobalNotifications(e.target.checked)} />
            Activer notifications
          </label>
        </div>

        <div className="border border-navy-800 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Audit & accès</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked={workflow.auditAccess.enabled} onChange={(e) => onChange({ ...config, adminWorkflow: { ...workflow, auditAccess: { ...workflow.auditAccess, enabled: e.target.checked } } })} />Activer Audit</label>
            <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked readOnly />Lecture seule (fixe)</label>
            <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked={workflow.auditAccess.logs} onChange={(e) => onChange({ ...config, adminWorkflow: { ...workflow, auditAccess: { ...workflow.auditAccess, logs: e.target.checked } } })} />Accès logs</label>
            <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked={workflow.auditAccess.history} onChange={(e) => onChange({ ...config, adminWorkflow: { ...workflow, auditAccess: { ...workflow.auditAccess, history: e.target.checked } } })} />Accès historique</label>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60">
            {saving ? 'Enregistrement...' : 'Enregistrer workflow'}
          </button>
        </div>
      </div>

      {mode && selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/60" onClick={() => setMode(null)} />
          <div className="relative card-navy max-w-xl w-full p-6 border border-navy-800">
            {mode === 'config' ? (
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold">Modifier: {selectedStep.role}</h3>
                <label className="text-slate-300 text-sm">Rôle
                  <input readOnly value={selectedStep.role} className="mt-1 w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white" />
                </label>
                <label className="text-slate-300 text-sm">SLA spécifique (h)
                  <input type="number" min={0} value={selectedStep.slaHours} onChange={(e) => onChange({ ...config, adminWorkflow: { ...workflow, steps: workflow.steps.map((s, i) => i === stepIndex ? { ...s, slaHours: Number(e.target.value) || 0 } : s) } })} className="mt-1 w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white" />
                </label>
                <div className="flex flex-wrap gap-3">
                  {ACTIONS.map((a) => (
                    <label key={a} className="text-xs text-slate-300 flex items-center gap-2">
                      <input type="checkbox" checked={selectedStep.actions.includes(a)} onChange={(e) => {
                        const nextActions = e.target.checked ? [...new Set([...selectedStep.actions, a])] : selectedStep.actions.filter((x) => x !== a);
                        onChange({ ...config, adminWorkflow: { ...workflow, steps: workflow.steps.map((s, i) => i === stepIndex ? { ...s, actions: nextActions } : s) } });
                      }} />
                      {a}
                    </label>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="text-slate-300 text-sm flex items-center gap-2"><input type="checkbox" checked={selectedStep.notificationEnabled} onChange={(e) => onChange({ ...config, adminWorkflow: { ...workflow, steps: workflow.steps.map((s, i) => i === stepIndex ? { ...s, notificationEnabled: e.target.checked } : s) } })} />Notifications actives</label>
                  <label className="text-slate-300 text-sm">Type
                    <select value={selectedStep.notificationType} onChange={(e) => onChange({ ...config, adminWorkflow: { ...workflow, steps: workflow.steps.map((s, i) => i === stepIndex ? { ...s, notificationType: e.target.value as 'email' | 'in-app' } : s) } })} className="mt-1 w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-sm text-white">
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
