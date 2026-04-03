import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Employee, Role } from '../models';
import { mockEmployees } from '../mock-data';

interface RoleContextType {
  currentRole: Role;
  setRole: (role: Role) => void;
  currentUser: Employee;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setRole] = useState<Role>('RH'); // Default role
  const currentUser = useMemo(() => {
    const exactMatch = mockEmployees.find((employee) => employee.role === currentRole);
    return exactMatch ?? mockEmployees[0];
  }, [currentRole]);

  return (
    <RoleContext.Provider value={{ currentRole, setRole, currentUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
