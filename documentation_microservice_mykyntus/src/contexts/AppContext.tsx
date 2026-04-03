import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  /** Interface en français uniquement. */
  language: 'fr';
  setLanguage: (_: 'fr') => void;
  t: (key: string) => string;
}

const messages: Record<string, string> = {
  'nav.dashboard': 'Tableau de bord',
  'nav.myDocs': 'Mes documents',
  'nav.requestDoc': 'Demander un document',
  'nav.requestTracking': 'Suivi des demandes',
  'nav.notifications': 'Notifications',
  'nav.settings': 'Paramètres',
  'nav.teamDocs': 'Documents de l’équipe',
  'nav.teamRequests': 'Demandes de l’équipe',
  'nav.allRequests': 'Toutes les demandes',
  'nav.docGen': 'Génération de documents',
  'nav.templates': 'Gestion des modèles',
  'nav.adminConfig': 'Configuration des documents',
  'nav.docTypes': 'Types de documents',
  'nav.permissions': 'Gestion des permissions',
  'nav.workflow': 'Configuration du flux',
  'nav.storage': 'Configuration du stockage',
  'nav.auditLogs': 'Journaux des documents',
  'nav.accessHistory': 'Historique d’accès',
  'nav.personal': 'Personnel',
  'nav.interface': 'Interface',
  'nav.switchRole': 'Changer de rôle (démo)',
  'nav.logout': 'Déconnexion',
  'header.search': 'Rechercher des documents…',
  'header.role': 'Développeur senior',
  'title.dashboard': 'Aperçu du tableau de bord',
  'title.myDocs': 'Mes documents',
  'title.request': 'Demander un document',
  'title.tracking': 'Suivi des demandes',
  'title.teamDocs': 'Documents de l’équipe',
  'title.teamRequests': 'Demandes de l’équipe',
  'title.hrMgmt': 'Toutes les demandes',
  'title.docGen': 'Génération de documents',
  'title.templates': 'Gestion des modèles',
  'title.adminConfig': 'Configuration générale',
  'title.docTypes': 'Types de documents',
  'title.permissions': 'Gestion des permissions',
  'title.workflow': 'Configuration du flux',
  'title.storage': 'Configuration du stockage',
  'title.auditLogs': 'Journaux des documents',
  'title.accessHistory': 'Historique d’accès',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [, setTick] = useState(0);

  useEffect(() => {
    document.documentElement.lang = 'fr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const setLanguage = (_: 'fr') => {
    setTick((n) => n + 1);
  };

  const t = (key: string): string => messages[key] ?? key;

  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, language: 'fr', setLanguage, t }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext doit être utilisé dans un AppProvider');
  }
  return context;
};
