import React from 'react';
import { Role, ICONS } from '../../types';
import { AdminShell } from './AdminShell';

export const AdminWorkflowPage: React.FC<{ role: Role }> = ({ role }) => {
  return (
    <AdminShell
      title="Configuration du workflow"
      description="Workflow fixe (pas de configuration par Admin)"
      icon={ICONS.Workflow}
    >
      <div className="card-navy p-6 space-y-2">
        <p className="text-slate-200">
          Seul le rôle <span className="font-bold">RH</span> peut approuver ou rejeter une demande de document.
        </p>
        <p className="text-slate-400 text-sm">
          Les rôles <span className="font-semibold">Coach</span>, <span className="font-semibold">Manager</span> et <span className="font-semibold">RP</span>{" "}
          ne peuvent pas utiliser les actions <span className="font-semibold">Approve</span> / <span className="font-semibold">Reject</span>.
        </p>
        {role === 'Admin' && (
          <p className="text-amber-400 text-sm">
            La configuration du flux n’est pas nécessaire côté <span className="font-semibold">Admin</span>.
          </p>
        )}
      </div>
    </AdminShell>
  );
};

