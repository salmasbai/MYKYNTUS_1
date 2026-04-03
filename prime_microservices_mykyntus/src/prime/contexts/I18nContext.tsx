import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

/** Interface entièrement en français. */
const messages: Record<string, string> = {
  'prime.dashboard.title': 'Tableau de bord des primes',
  'prime.dashboard.subtitle': 'Vue globale des performances et de la distribution des primes',
  'prime.types.title': 'Types de prime',
  'prime.rules.title': 'Règles de prime',
  'prime.results.title': 'Résultats des primes',
  'prime.validation.title': 'Validation des primes',
  'prime.history.title': 'Historique des primes',
  'layout.menu': 'Menu',
  'topbar.search.placeholder': 'Rechercher…',
  'topbar.role.label': 'Rôle',
  'topbar.notifications': 'Notifications',
  'settings.title': 'Paramètres',
  'settings.theme': 'Thème',
  'settings.theme.light': 'Clair',
  'settings.theme.dark': 'Sombre',
  'settings.notifications': 'Préférences de notification',
  'notifications.primeValidated': 'Prime validée',
  'notifications.primeRejected': 'Prime rejetée',
  'notifications.newPrimeRule': 'Nouvelle règle de prime créée',
  'notifications.teamPerformanceUpdated': "Performance d'équipe mise à jour",
};

interface I18nContextValue {
  lang: 'fr';
  t: (key: string) => string;
  setLanguage: (_: 'fr') => void;
}

const LANG_STORAGE_KEY = 'prime_lang';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, 'fr');
    document.documentElement.lang = 'fr';
    document.documentElement.dir = 'ltr';
  }, []);

  const setLanguage = (_next: 'fr') => {
    setTick((n) => n + 1);
  };

  const t = (key: string): string => messages[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang: 'fr', t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n doit être utilisé dans un I18nProvider');
  }
  return ctx;
}
