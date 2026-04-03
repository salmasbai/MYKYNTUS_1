export interface AuditEntry {
  id: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
}

export const AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'A-001',
    user: 'RH_Sarah',
    role: 'RH',
    action: 'VALIDATE_REFERRAL',
    entity: 'Referral',
    entityId: 'REF-2024-001',
    timestamp: '2024-03-10 09:15',
  },
  {
    id: 'A-002',
    user: 'Admin_Tech',
    role: 'ADMIN',
    action: 'UPDATE_SETTINGS',
    entity: 'Settings',
    entityId: 'bonus_rules',
    timestamp: '2024-03-09 17:42',
  },
  {
    id: 'A-003',
    user: 'Auditor_1',
    role: 'AUDIT',
    action: 'EXPORT_REPORT',
    entity: 'Referral',
    entityId: 'ALL',
    timestamp: '2024-03-09 08:12',
  },
];

