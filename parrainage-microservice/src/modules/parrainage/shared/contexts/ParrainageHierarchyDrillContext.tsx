import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from '../../../../../frontend/app/hooks/useAuth';
import type { HierarchyDrillSelection } from '../utils/orgHierarchy';

export type { HierarchyDrillSelection } from '../utils/orgHierarchy';

interface Value {
  drill: HierarchyDrillSelection;
  setManagerId: (id: string | undefined) => void;
  setCoachId: (id: string | undefined) => void;
  resetDrill: () => void;
}

const Ctx = createContext<Value | undefined>(undefined);

export function ParrainageHierarchyDrillProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const role = user?.role;
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

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useParrainageHierarchyDrill() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useParrainageHierarchyDrill requires ParrainageHierarchyDrillProvider');
  return v;
}
