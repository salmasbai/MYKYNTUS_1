import React from 'react';
import { DataTable } from '../../../shared/components/DataTable';

interface MatrixRow {
  id: string;
  role: string;
  create: boolean;
  view: boolean;
  validate: boolean;
  delete: boolean;
  config: boolean;
}

const MATRIX: MatrixRow[] = [
  { id: 'ADMIN', role: 'ADMIN', create: false, view: true, validate: false, delete: false, config: true },
  { id: 'RH', role: 'RH', create: true, view: true, validate: true, delete: true, config: false },
  { id: 'RP', role: 'RP', create: false, view: true, validate: true, delete: false, config: false },
  { id: 'MANAGER', role: 'MANAGER', create: false, view: true, validate: false, delete: false, config: false },
  { id: 'PILOTE', role: 'PILOTE', create: true, view: true, validate: false, delete: false, config: false },
  { id: 'EMPLOYEE', role: 'EMPLOYEE', create: true, view: true, validate: false, delete: false, config: false },
];

export const RolePermissions: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-50">Rôles & permissions</h2>
      <DataTable<MatrixRow>
        columns={[
          { key: 'role', header: 'Rôle' },
          { key: 'create', header: 'Créer', render: (r) => (r.create ? '✅' : '❌') },
          { key: 'view', header: 'Voir', render: (r) => (r.view ? '✅' : '❌') },
          { key: 'validate', header: 'Valider', render: (r) => (r.validate ? '✅' : '❌') },
          { key: 'delete', header: 'Supprimer', render: (r) => (r.delete ? '✅' : '❌') },
          { key: 'config', header: 'Configuration', render: (r) => (r.config ? '✅' : '❌') },
        ]}
        data={MATRIX}
      />
    </div>
  );
};

