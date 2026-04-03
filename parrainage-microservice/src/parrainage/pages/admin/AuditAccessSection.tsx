import React from 'react';
import type { SystemConfig } from '../../models/SystemConfig';

export interface AuditAccessSectionProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

/**
 * Paramètres audit / logs / export — réservés au niveau administrateur global.
 * Ne pas monter ce composant pour le rôle RH (voir AdminSystemConfig).
 */
export const AuditAccessSection: React.FC<AuditAccessSectionProps> = ({ config, setConfig }) => {
  const workflow = config.adminWorkflow!;

  return (
    <div className="border border-navy-800 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-200">Audit & accès</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm text-slate-300 flex items-center gap-2">
          <input
            type="checkbox"
            checked={workflow.auditAccess.enabled}
            onChange={(e) =>
              setConfig({
                ...config,
                adminWorkflow: {
                  ...workflow,
                  auditAccess: { ...workflow.auditAccess, enabled: e.target.checked },
                },
              })
            }
          />
          Activer Audit
        </label>
        <label className="text-sm text-slate-300 flex items-center gap-2">
          <input type="checkbox" checked readOnly />
          Lecture seule (fixe)
        </label>
        <label className="text-sm text-slate-300 flex items-center gap-2">
          <input
            type="checkbox"
            checked={workflow.auditAccess.logs}
            onChange={(e) =>
              setConfig({
                ...config,
                adminWorkflow: {
                  ...workflow,
                  auditAccess: { ...workflow.auditAccess, logs: e.target.checked },
                },
              })
            }
          />
          Accès logs
        </label>
        <label className="text-sm text-slate-300 flex items-center gap-2">
          <input
            type="checkbox"
            checked={workflow.auditAccess.history}
            onChange={(e) =>
              setConfig({
                ...config,
                adminWorkflow: {
                  ...workflow,
                  auditAccess: { ...workflow.auditAccess, history: e.target.checked },
                },
              })
            }
          />
          Accès historique
        </label>
        <label className="text-sm text-slate-300 flex items-center gap-2">
          <input
            type="checkbox"
            checked={workflow.auditAccess.export}
            onChange={(e) =>
              setConfig({
                ...config,
                adminWorkflow: {
                  ...workflow,
                  auditAccess: { ...workflow.auditAccess, export: e.target.checked },
                },
              })
            }
          />
          Export
        </label>
      </div>
    </div>
  );
};
