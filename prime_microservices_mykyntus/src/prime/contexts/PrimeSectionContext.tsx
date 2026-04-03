import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type RpSection = 'dashboard' | 'performance' | 'validation' | 'suivi-projet' | 'notifications' | 'settings';
export type AdminSection = 'dashboard' | 'engine' | 'access' | 'workflows' | 'logs' | 'anomalies' | 'notifications' | 'settings';
export type AuditSection =
  | 'dashboard'
  | 'journal'
  | 'anomalies'
  | 'reporting'
  | 'access-history'
  | 'notifications'
  | 'settings';

interface PrimeSectionContextValue {
  activeRpSection: RpSection;
  setActiveRpSection: (s: RpSection) => void;
  activeAdminSection: AdminSection;
  setActiveAdminSection: (s: AdminSection) => void;
  activeAuditSection: AuditSection;
  setActiveAuditSection: (s: AuditSection) => void;
}

const PrimeSectionContext = createContext<PrimeSectionContextValue | undefined>(undefined);

export function PrimeSectionProvider({ children }: { children: ReactNode }) {
  const [activeRpSection, setActiveRpSection] = useState<RpSection>('dashboard');
  const [activeAdminSection, setActiveAdminSection] = useState<AdminSection>('dashboard');
  const [activeAuditSection, setActiveAuditSection] = useState<AuditSection>('journal');

  const value = useMemo(
    () => ({
      activeRpSection,
      setActiveRpSection,
      activeAdminSection,
      setActiveAdminSection,
      activeAuditSection,
      setActiveAuditSection,
    }),
    [activeRpSection, activeAdminSection, activeAuditSection],
  );

  return <PrimeSectionContext.Provider value={value}>{children}</PrimeSectionContext.Provider>;
}

export function usePrimeSection() {
  const ctx = useContext(PrimeSectionContext);
  if (!ctx) throw new Error('usePrimeSection must be used within PrimeSectionProvider');
  return ctx;
}

