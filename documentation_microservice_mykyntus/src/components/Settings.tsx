import React from 'react';
import { Role } from '../types';
import { SettingsModule } from './settings/SettingsModule';

interface SettingsProps {
  role: Role;
}

export const Settings: React.FC<SettingsProps> = ({ role }) => {
  return <SettingsModule role={role} />;
};
