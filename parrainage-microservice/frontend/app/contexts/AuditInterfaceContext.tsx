import React, { createContext, useContext, useMemo, useState } from 'react';

export type AuditInterfaceSectionId =
  | 'dashboard'
  | 'journal'
  | 'access-history'
  | 'anomalies'
  | 'reporting';

interface AuditInterfaceContextValue {
  section: AuditInterfaceSectionId;
  setSection: (s: AuditInterfaceSectionId) => void;
}

const AuditInterfaceContext = createContext<AuditInterfaceContextValue | undefined>(undefined);

export function AuditInterfaceProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<AuditInterfaceSectionId>('journal');
  const value = useMemo(() => ({ section, setSection }), [section]);
  return <AuditInterfaceContext.Provider value={value}>{children}</AuditInterfaceContext.Provider>;
}

export function useAuditInterface() {
  const ctx = useContext(AuditInterfaceContext);
  if (!ctx) throw new Error('useAuditInterface must be used within AuditInterfaceProvider');
  return ctx;
}
