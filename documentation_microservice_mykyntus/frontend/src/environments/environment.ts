import { DocumentationHeaders } from '../app/core/constants/documentation-headers';

/**
 * En production, la gateway pose les en-têtes (identity hors de cette appli).
 * Ici : valeurs de **repli** avant localStorage — l’annuaire réel est chargé via GET .../users/me.
 */
export const environment = {
  production: false,
  /** Barre de sélection rôle / utilisateur (sans login). Désactivé en build production. */
  documentationDevToolsEnabled: true,
  apiBaseUrl: 'http://localhost:5002',
  documentationUserContextHeaders: {
    [DocumentationHeaders.userId]: '11111111-1111-4111-8111-111111111101',
    [DocumentationHeaders.userRole]: 'pilote',
    [DocumentationHeaders.tenantId]: 'atlas-tech-demo',
  } as Record<string, string>,
};
