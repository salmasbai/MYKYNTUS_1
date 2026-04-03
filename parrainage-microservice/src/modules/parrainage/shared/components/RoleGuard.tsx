import React from 'react';
import { useAuth } from '../../../../../frontend/app/hooks/useAuth';
import { AccessDenied } from './AccessDenied';

export type Role = 'ADMIN' | 'RH' | 'MANAGER' | 'COACH' | 'RP' | 'PILOTE' | 'AUDIT';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallbackPath?: string;
  fallbackLabel?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/parrainage/pilote/dashboard',
  fallbackLabel = 'Retour',
}) => {
  const { user } = useAuth();
  const role = user?.role as Role | undefined;
  const allowed = role && allowedRoles.includes(role);

  if (!allowed) {
    const path =
      role === 'MANAGER' || role === 'COACH' || role === 'RP'
        ? '/parrainage/pm/dashboard'
        : role === 'ADMIN'
          ? '/parrainage/admin/dashboard'
          : role === 'RH'
            ? '/parrainage/rh/dashboard'
            : fallbackPath;
    return (
      <AccessDenied
        message="Accès refusé. Vous n'avez pas les droits nécessaires pour cette section."
        backTo={{ to: path, label: fallbackLabel }}
      />
    );
  }

  return <>{children}</>;
};
