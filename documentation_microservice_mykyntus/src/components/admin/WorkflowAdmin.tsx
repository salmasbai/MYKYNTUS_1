import { useEffect, useMemo, useState } from 'react';
import type { AdminWorkflowDefinition, WorkflowActionKey, WorkflowNotificationKey } from '../../adminDocumentation/documentAdminModels';

const actionOptions: WorkflowActionKey[] = ['Validate', 'Reject', 'Approve', 'Archive'];
const roleDetails: Record<string, string> = {
  Coach: 'Premier niveau de validation opérationnelle.',
  Manager: 'Validation managériale de cohérence.',
  RP: 'Arbitrage projet avant finalisation.',
  RH: 'Validation finale et archivage.',
};

interface Props {
  workflow: AdminWorkflowDefinition;
  onChange: (next: AdminWorkflowDefinition) => void;
  onSave: () => Promise<void> | void;
  saving?: boolean;
}

export function WorkflowAdmin({ workflow, onChange, onSave, saving = false }: Props) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [mode, setMode] = useState<'config' | 'details' | null>(null);
  const [globalSla, setGlobalSla] = useState(48);
  const [globalNotifications, setGlobalNotifications] = useState(true);

  useEffect(() => {
    const avg = workflow.steps.length ? Math.round(workflow.steps.reduce((a, s) => a + s.slaHours, 0) / workflow.steps.length) : 48;
    setGlobalSla(avg);
    setGlobalNotifications(workflow.steps.some((s) => s.notificationKey !== 'none'));
  }, [workflow.steps]);

  const stepIndex = useMemo(() => {
    if (!selectedStepId) return -1;
    return workflow.steps.findIndex((s) => s.id === selectedStepId);
  }, [workflow.steps, selectedStepId]);
  const selectedStep = stepIndex >= 0 ? workflow.steps[stepIndex] : null;

  const moveStep = (index: number, direction: -1 | 1) => {
    if (workflow.steps[index]?.assignedRole === 'RH') return;
    const next = [...workflow.steps];
    const target = index + direction;
    if (target < 0 || target >= next.length || next[target]?.assignedRole === 'RH') return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...workflow, steps: next });
  };

  const save = () => onSave();

  return (
    <div className="card-navy p-6 space-y-6">
      <div className="space-y-3">
        {workflow.steps.map((step, index) => (
          <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-800 bg-navy-900/40">
            <span className="text-slate-200">{index + 1}. {step.assignedRole}</span>
            <div className="flex gap-2 items-center">
              <button onClick={() => moveStep(index, -1)} disabled={step.assignedRole === 'RH'} className="px-2 py-1 rounded bg-navy-800 text-slate-300 disabled:opacity-40">↑</button>
              <button onClick={() => moveStep(index, 1)} disabled={step.assignedRole === 'RH'} className="px-2 py-1 rounded bg-navy-800 text-slate-300 disabled:opacity-40">↓</button>
              <button onClick={() => { setSelectedStepId(step.id); setMode('config'); }} className="px-2 py-1 rounded bg-navy-800 text-slate-300">Modifier</button>
              <button onClick={() => { setSelectedStepId(step.id); setMode('details'); }} className="px-2 py-1 rounded bg-navy-800 text-slate-300">Détails</button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-slate-300 text-sm">SLA global (heures)
          <input type="number" min={0} value={globalSla} onChange={(e) => setGlobalSla(Number(e.target.value) || 0)} className="mt-1 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200" />
        </label>
        <label className="text-slate-300 text-sm flex items-center gap-2 mt-7">
          <input type="checkbox" checked={globalNotifications} onChange={(e) => setGlobalNotifications(e.target.checked)} />
          Activer notifications
        </label>
      </div>

      <div className="border border-navy-800 rounded-xl p-4 bg-navy-900/30">
        <h5 className="text-white font-bold">Audit & accès</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked={workflow.auditAccess.enabled} onChange={(e) => onChange({ ...workflow, auditAccess: { ...workflow.auditAccess, enabled: e.target.checked } })} />Activer Audit</label>
          <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked readOnly />Lecture seule (fixe)</label>
          <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked={workflow.auditAccess.logs} onChange={(e) => onChange({ ...workflow, auditAccess: { ...workflow.auditAccess, logs: e.target.checked } })} />Accès logs</label>
          <label className="text-sm text-slate-300 flex items-center gap-2"><input type="checkbox" checked={workflow.auditAccess.history} onChange={(e) => onChange({ ...workflow, auditAccess: { ...workflow.auditAccess, history: e.target.checked } })} />Accès historique</label>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60">
          {saving ? 'Enregistrement...' : 'Enregistrer workflow'}
        </button>
      </div>

      {mode && selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-navy-950/80" onClick={() => setMode(null)} />
          <div className="relative card-navy max-w-xl w-full p-6 border border-navy-800">
            {mode === 'config' ? (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg">Modifier: {selectedStep.assignedRole}</h3>
                <label className="text-slate-300 text-sm">Rôle
                  <input readOnly value={selectedStep.assignedRole} className="mt-1 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200" />
                </label>
                <label className="text-slate-300 text-sm">SLA spécifique
                  <input type="number" min={0} value={selectedStep.slaHours} onChange={(e) => onChange({ ...workflow, steps: workflow.steps.map((s, i) => i === stepIndex ? { ...s, slaHours: Number(e.target.value) || 0 } : s) })} className="mt-1 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200" />
                </label>
                <div className="flex flex-wrap gap-3">
                  {actionOptions.map((a) => (
                    <label key={a} className="text-sm text-slate-300 flex items-center gap-2">
                      <input type="checkbox" checked={selectedStep.actions.includes(a)} onChange={(e) => {
                        const nextActions = e.target.checked ? [...new Set([...selectedStep.actions, a])] : selectedStep.actions.filter((x) => x !== a);
                        onChange({ ...workflow, steps: workflow.steps.map((s, i) => i === stepIndex ? { ...s, actions: nextActions } : s) });
                      }} />
                      {a}
                    </label>
                  ))}
                </div>
                <label className="text-slate-300 text-sm">Type notification
                  <select value={selectedStep.notificationKey} onChange={(e) => onChange({ ...workflow, steps: workflow.steps.map((s, i) => i === stepIndex ? { ...s, notificationKey: e.target.value as WorkflowNotificationKey } : s) })} className="mt-1 w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-sm text-slate-200">
                    <option value="email">Email</option>
                    <option value="none">Aucune</option>
                  </select>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-lg">Détails: {selectedStep.assignedRole}</h3>
                <p className="text-slate-300 text-sm">{roleDetails[selectedStep.assignedRole] ?? 'Étape de validation du workflow.'}</p>
                <p className="text-slate-400 text-sm">Hiérarchie: Pilote → Coach → Manager → RP → RH</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
