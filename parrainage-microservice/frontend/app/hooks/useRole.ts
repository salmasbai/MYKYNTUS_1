import React, { createContext, useContext, useState } from 'react';
import type { Role } from '../providers/AuthProvider';

interface RoleContextValue {
  role: Role | null;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role | null>(null);
  return React.createElement(RoleContext.Provider, { value: { role, setRole } }, children);
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole doit être utilisé dans un RoleProvider');
  return ctx;
};

