import React from 'react';
import { useAuth } from '../../../app/hooks/useAuth';
import { PiloteDashboard } from '../../../../src/parrainage/pages/pilote/PiloteDashboard';
import { ReferralDashboardRH } from '../../../../src/parrainage/pages/rh/ReferralDashboardRH';
import { AdminDashboard } from '../../../../src/parrainage/pages/admin/AdminDashboard';
import { PMDashboard } from '../../../../src/parrainage/pages/pm/PMDashboard';

export const RoleHome: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? 'PILOTE';

  if (role === 'RH') return <ReferralDashboardRH />;
  if (role === 'ADMIN') return <AdminDashboard />;
  if (role === 'MANAGER' || role === 'COACH' || role === 'RP') return <PMDashboard />;
  return <PiloteDashboard />;
};

