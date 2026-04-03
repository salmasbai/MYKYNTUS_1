import { useEffect, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { AdminPrimeService } from '../../services/admin-prime.service';
import type { AdminWorkflowConfig } from '../../mock-data/admin';
import { WorkflowAdmin } from '../../components/admin/WorkflowAdmin';

export function AdminWorkflow() {
  const [workflow, setWorkflow] = useState<AdminWorkflowConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AdminPrimeService.getWorkflowConfig().then(setWorkflow);
  }, []);

  if (!workflow) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div></div>;

  const save = async () => {
    setSaving(true);
    try {
      const saved = await AdminPrimeService.saveWorkflowConfig(workflow);
      setWorkflow(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-navy-950 min-h-full">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
          <GitBranch className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Configuration du workflow</h3>
          <p className="text-sm text-slate-500">Pilote → Coach → Manager → RP → RH</p>
        </div>
      </div>
      <WorkflowAdmin workflow={workflow} onChange={setWorkflow} onSave={save} saving={saving} />
    </div>
  );
}
