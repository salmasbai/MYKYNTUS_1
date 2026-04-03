import React from 'react';
import { useAuth } from '../hooks/useAuth';

export type ParrainageView =
  | 'pilote-dashboard'
  | 'pilote-submit'
  | 'pilote-referrals'
  | 'pilote-bonus'
  | 'rh-dashboard'
  | 'rh-management'
  | 'rh-details'
  | 'rh-rules'
  | 'rh-history'
  | 'admin-dashboard'
  | 'admin-tools'
  | 'admin-workflow'
  | 'admin-config'
  | 'admin-payments'
  | 'admin-audit'
  | 'pm-dashboard'
  | 'pm-team'
  | 'pm-referrals'
  | 'pm-performance'
  | 'notifications'
  | 'settings';

type RoleKey = 'PILOTE' | 'RH' | 'ADMIN' | 'MANAGER' | 'COACH' | 'RP' | 'AUDIT';

const defaultViewByRole: Record<RoleKey, ParrainageView> = {
  PILOTE: 'pilote-dashboard',
  RH: 'rh-dashboard',
  ADMIN: 'admin-dashboard',
  MANAGER: 'pm-dashboard',
  COACH: 'pm-dashboard',
  RP: 'pm-dashboard',
  AUDIT: 'admin-audit',
};

interface NavigationContextValue {
  currentView: ParrainageView;
  setCurrentView: (view: ParrainageView) => void;
  selectedReferralId: string | null;
  openReferralDetails: (id: string) => void;
}

const NavigationContext = React.createContext<NavigationContextValue | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const role = (user?.role ?? 'PILOTE') as RoleKey;
  const [currentView, setCurrentView] = React.useState<ParrainageView>(defaultViewByRole[role]);
  const [selectedReferralId, setSelectedReferralId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCurrentView(defaultViewByRole[role]);
    setSelectedReferralId(null);
  }, [role]);

  const openReferralDetails = (id: string) => {
    setSelectedReferralId(id);
    setCurrentView('rh-details');
  };

  return (
    <NavigationContext.Provider value={{ currentView, setCurrentView, selectedReferralId, openReferralDetails }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = React.useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
};

