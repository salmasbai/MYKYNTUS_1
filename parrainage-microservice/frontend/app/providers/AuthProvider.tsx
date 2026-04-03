import React, { createContext, useContext, useState } from 'react';

export type Role = 'RH' | 'PILOTE' | 'ADMIN' | 'MANAGER' | 'COACH' | 'RP' | 'AUDIT';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  /** Supérieur hiérarchique (Pilote→Coach→Manager→RP). */
  parentId?: string;
  projectId?: string;
  /** Périmètre organisationnel (aligné sur ORG_NODES). */
  departmentId?: string;
  poleId?: string;
  celluleId?: string;
}

const DEMO_ORG = { departmentId: 'dept-1', poleId: 'pole-1', celluleId: 'cell-1' } as const;
const RH_ORG = { departmentId: 'dept-2', poleId: 'pole-rh', celluleId: 'cell-rh' } as const;

interface AuthContextValue {
  user: User | null;
  loginAsRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USERS: Record<Role, User> = {
  PILOTE: {
    id: 'emp-1',
    name: 'Jean Dupont',
    email: 'jean.dupont@mykyntus.com',
    role: 'PILOTE',
    parentId: 'coach-1',
    ...DEMO_ORG,
  },
  COACH: {
    id: 'coach-1',
    name: 'Marc Lefèvre',
    email: 'coach@mykyntus.com',
    role: 'COACH',
    parentId: 'mgr-1',
    ...DEMO_ORG,
  },
  MANAGER: {
    id: 'mgr-1',
    name: 'Charlie Durand',
    email: 'manager@mykyntus.com',
    role: 'MANAGER',
    parentId: 'rp-1',
    projectId: 'proj-1',
    ...DEMO_ORG,
  },
  RP: {
    id: 'rp-1',
    name: 'Rachid El Amrani',
    email: 'rp@mykyntus.com',
    role: 'RP',
    ...DEMO_ORG,
  },
  RH: { id: 'rh-1', name: 'Camille Rousseau', email: 'rh@mykyntus.com', role: 'RH', ...RH_ORG },
  ADMIN: { id: 'admin-1', name: 'Administrateur démo', email: 'admin@mykyntus.com', role: 'ADMIN', ...DEMO_ORG },
  AUDIT: {
    id: 'audit-1',
    name: 'Auditeur',
    email: 'audit@mykyntus.com',
    role: 'AUDIT',
    ...DEMO_ORG,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USERS.PILOTE);

  const loginAsRole = (role: Role) => {
    setUser(DEMO_USERS[role]);
  };

  return (
    <AuthContext.Provider value={{ user, loginAsRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
};
