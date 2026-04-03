import React, { useState } from 'react';
import { DataTable } from '../../../shared/components/DataTable';
import { AUDIT_LOGS, AuditEntry } from '../../../mock/audit.mock';
import { Select } from '../../../shared/components/Select';

export const AuditLog: React.FC = () => {
  const [role, setRole] = useState<string>('all');
  const [action, setAction] = useState<string>('all');

  const filtered = AUDIT_LOGS.filter((e) => {
    if (role !== 'all' && e.role !== role) return false;
    if (action !== 'all' && e.action !== action) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-50">Journal d’audit complet</h2>
      <div className="card-navy p-3 md:p-4 flex flex-wrap gap-3">
        <Select label="Rôle" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">Tous</option>
          <option value="ADMIN">ADMIN</option>
          <option value="RH">RH</option>
          <option value="RP">RP</option>
          <option value="MANAGER">MANAGER</option>
          <option value="PILOTE">PILOTE</option>
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="AUDIT">AUDIT</option>
        </Select>
        <Select label="Action" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="all">Toutes</option>
          <option value="VALIDATE_REFERRAL">VALIDATE_REFERRAL</option>
          <option value="UPDATE_SETTINGS">UPDATE_SETTINGS</option>
          <option value="EXPORT_REPORT">EXPORT_REPORT</option>
        </Select>
      </div>
      <DataTable<AuditEntry>
        columns={[
          { key: 'timestamp', header: 'Date' },
          { key: 'user', header: 'Utilisateur' },
          { key: 'role', header: 'Rôle' },
          { key: 'action', header: 'Action' },
          { key: 'entity', header: 'Entité' },
          { key: 'entityId', header: 'ID' },
        ]}
        data={filtered}
      />
    </div>
  );
};

