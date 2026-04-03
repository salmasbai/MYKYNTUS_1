import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Role } from '../types';
import type { HierarchyDrillSelection } from '../lib/documentationOrgHierarchy';

export type { HierarchyDrillSelection } from '../lib/documentationOrgHierarchy';

interface Value {
  drill: HierarchyDrillSelection;
  setManagerId: (id: string | undefined) => void;
  setCoachId: (id: string | undefined) => void;
  resetDrill: () => void;
}

const DocumentationHierarchyDrillContext = createContext<Value | undefined>(undefined);

export function DocumentationHierarchyDrillProvider({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const [drill, setDrill] = useState<HierarchyDrillSelection>({});

  const setManagerId = useCallback((id: string | undefined) => {
    setDrill((d) => ({ ...d, managerId: id, coachId: undefined }));
  }, []);

  const setCoachId = useCallback((id: string | undefined) => {
    setDrill((d) => ({ ...d, coachId: id }));
  }, []);

  const resetDrill = useCallback(() => setDrill({}), []);

  React.useEffect(() => {
    resetDrill();
  }, [role, resetDrill]);

  const value = useMemo(
    () => ({ drill, setManagerId, setCoachId, resetDrill }),
    [drill, setManagerId, setCoachId, resetDrill],
  );

  return (
    <DocumentationHierarchyDrillContext.Provider value={value}>
      {children}
    </DocumentationHierarchyDrillContext.Provider>
  );
}

export function useDocumentationHierarchyDrill() {
  const ctx = useContext(DocumentationHierarchyDrillContext);
  if (!ctx) throw new Error('useDocumentationHierarchyDrill requires DocumentationHierarchyDrillProvider');
  return ctx;
}
