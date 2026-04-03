import React from 'react';
import { AuditJournalTable } from './audit/AuditJournalTable';

export const AuditAccessHistory: React.FC = () => {
  return <AuditJournalTable title="Historique d’accès" />;
};
