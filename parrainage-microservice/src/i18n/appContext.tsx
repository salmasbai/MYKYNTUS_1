import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
}

/** Interface entièrement en français (clés conservées pour compatibilité avec les écrans legacy). */
const translations: Record<string, string> = {
  'nav.dashboard': 'Tableau de bord',
  'nav.submitReferral': 'Soumettre un parrainage',
  'nav.myReferrals': 'Mes parrainages',
  'nav.bonus': 'Suivi des primes',
  'nav.notifications': 'Notifications',
  'nav.settings': 'Paramètres',
  'nav.switchRole': 'Changer de rôle (démo)',
  'nav.logout': 'Déconnexion',
  'header.search': 'Rechercher un parrainage…',
  'title.dashboard': 'Vue d’ensemble du parrainage',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const t = (key: string): string => translations[key] ?? key;

  return (
    <AppContext.Provider value={{ theme, toggleTheme, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext doit être utilisé dans un AppProvider');
  return context;
};
