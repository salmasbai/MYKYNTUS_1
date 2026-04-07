/**
 * Build production : pas d’outils dev, pas d’en-têtes simulés côté client.
 * L’API doit être protégée par la gateway (identité en amont).
 */
export const environment = {
  production: true,
  documentationDevToolsEnabled: false,
  apiBaseUrl: '',
  documentationUserContextHeaders: {} as Record<string, string>,
};
