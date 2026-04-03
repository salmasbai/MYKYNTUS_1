import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRole } from './RoleContext';
import type { HierarchyDrillSelection } from '../lib/hierarchyDrillDown';

export type { HierarchyDrillSelection } from '../lib/hierarchyDrillDown';

interface HierarchyDrillContextValue {
  drill: HierarchyDrillSelection;
  setManagerId: (id: string | undefined) => void;
  setCoachId: (id: string | undefined) => void;
  resetDrill: () => void;
}

const HierarchyDrillContext = createContext<HierarchyDrillContextValue | undefined>(undefined);

export function HierarchyDrillProvider({ children }: { children: React.ReactNode }) {
  const { currentRole } = useRole();
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
  }, [currentRole, resetDrill]);

  const value = useMemo(
    () => ({ drill, setManagerId, setCoachId, resetDrill }),
    [drill, setManagerId, setCoachId, resetDrill],
  );

  return <HierarchyDrillContext.Provider value={value}>{children}</HierarchyDrillContext.Provider>;
}

export function useHierarchyDrill() {
  const ctx = useContext(HierarchyDrillContext);
  if (!ctx) throw new Error('useHierarchyDrill requires HierarchyDrillProvider');
  return ctx;
}
