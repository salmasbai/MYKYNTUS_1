import React from 'react';
import { AccessDenied } from '../../components/AccessDenied';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';
import { GlobalNotificationsPage } from '../shared/GlobalNotificationsPage';

export const AdminNotifications: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'MANAGER' || user?.role === 'COACH') {
    return <AccessDenied backTo={{ to: '/parrainage/pm/dashboard', label: 'Retour au tableau de bord équipe' }} />;
  }
  return <GlobalNotificationsPage />;
};
