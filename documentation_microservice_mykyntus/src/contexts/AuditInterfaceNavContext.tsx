import React, { createContext, useContext, useMemo, useState } from 'react';

export type AuditInterfaceSectionId = 'dashboard' | 'journal' | 'access-history' | 'anomalies' | 'reporting';

interface AuditInterfaceNavContextValue {
  section: AuditInterfaceSectionId;
  setSection: (s: AuditInterfaceSectionId) => void;
}

const AuditInterfaceNavContext = createContext<AuditInterfaceNavContextValue | undefined>(undefined);

export function AuditInterfaceNavProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<AuditInterfaceSectionId>('journal');
  const value = useMemo(() => ({ section, setSection }), [section]);
  return <AuditInterfaceNavContext.Provider value={value}>{children}</AuditInterfaceNavContext.Provider>;
}

export function useAuditInterfaceNav() {
  const ctx = useContext(AuditInterfaceNavContext);
  if (!ctx) throw new Error('useAuditInterfaceNav must be used within AuditInterfaceNavProvider');
  return ctx;
}
