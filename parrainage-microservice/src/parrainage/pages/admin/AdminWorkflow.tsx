import React, { useEffect, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { AccessDenied } from '../../components/AccessDenied';
import { AdminService } from '../../services/AdminService';
import type { SystemConfig } from '../../models/SystemConfig';
import { WorkflowAdmin } from '../../components/admin/WorkflowAdmin';

export const AdminWorkflow: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SystemConfig>(AdminService.getSystemConfig());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfig(AdminService.getSystemConfig());
  }, []);

  if (user?.role !== 'ADMIN' && user?.role !== 'RH') {
    return <AccessDenied message="Accès refusé. Workflow réservé à Admin/RH." backTo={{ to: '/dashboard', label: 'Retour' }} />;
  }

  const save = () => {
    setSaving(true);
    try {
      setConfig(
        AdminService.updateSystemConfig(config, {
          id: user?.id ?? 'admin-1',
          label: user?.name ?? 'Administrateur',
          role: user?.role,
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
          <GitBranch className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Configuration du workflow</h3>
          <p className="text-sm text-slate-500">Pilote → Coach → Manager → RP → RH</p>
        </div>
      </div>
      <WorkflowAdmin config={config} onChange={setConfig} onSave={save} saving={saving} />
    </div>
  );
};
