import React from 'react';
import { AuditJournalTable } from '../audit/AuditJournalTable';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const AuditDashboard: React.FC<Props> = ({ setActiveTab }) => {
  void setActiveTab;
  return <AuditJournalTable title="Journal d’audit" />;
};
