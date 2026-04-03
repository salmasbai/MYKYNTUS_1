import React from 'react';
import { Role } from '../types';
import { AdminConfigurationPage } from './admin/AdminConfigurationPage';
import { AdminDocTypesPage } from './admin/AdminDocTypesPage';
import { AdminPermissionsPage } from './admin/AdminPermissionsPage';
import { AdminWorkflowPage } from './admin/AdminWorkflowPage';
import { AdminStoragePage } from './admin/AdminStoragePage';

export const AdminConfiguration: React.FC<{ role: Role }> = ({ role }) => (
  <AdminConfigurationPage role={role} />
);

export const AdminDocTypes: React.FC<{ role: Role }> = ({ role }) => (
  <AdminDocTypesPage role={role} />
);

export const AdminPermissions: React.FC<{ role: Role }> = ({ role }) => (
  <AdminPermissionsPage role={role} />
);

export const AdminWorkflow: React.FC<{ role: Role }> = ({ role }) => (
  <AdminWorkflowPage role={role} />
);

export const AdminStorage: React.FC<{ role: Role }> = ({ role }) => (
  <AdminStoragePage role={role} />
);
