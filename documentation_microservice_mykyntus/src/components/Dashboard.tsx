import React from 'react';
import { Role } from '../types';
import { PiloteDashboard } from './dashboards/PiloteDashboard';
import { ManagerDashboard } from './dashboards/ManagerDashboard';
import { RHDashboard } from './dashboards/RHDashboard';
import { RPDashboard } from './dashboards/RPDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { AuditDashboard } from './dashboards/AuditDashboard';

interface DashboardProps {
  role: Role;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, setActiveTab }) => {
  switch (role) {
    case 'Pilote':
      return <PiloteDashboard setActiveTab={setActiveTab} role={role} />;
    case 'Coach':
    case 'Manager':
      return <ManagerDashboard setActiveTab={setActiveTab} role={role} />;
    case 'RH':
      return <RHDashboard setActiveTab={setActiveTab} />;
    case 'RP':
      return <RPDashboard setActiveTab={setActiveTab} role={role} />;
    case 'Admin':
      return <AdminDashboard setActiveTab={setActiveTab} />;
    case 'Audit':
      return <AuditDashboard setActiveTab={setActiveTab} />;
    default:
      return <PiloteDashboard setActiveTab={setActiveTab} role="Pilote" />;
  }
};
