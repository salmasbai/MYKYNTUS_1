/**
 * Contrat gateway (standard) + variantes X-Documentation-* acceptées par le backend pour transition.
 * Constantes alignées sur `DocumentationInboundHeaders` côté API .NET.
 */
export const DocumentationHeaders = {
  userId: 'X-User-Id',
  userRole: 'X-User-Role',
  tenantId: 'X-Tenant-Id',
  correlationId: 'X-Correlation-Id',
  /** Périmètre hiérarchique (optionnel) — aligné sur DocumentationInboundHeaders côté API. */
  scopeManagerId: 'X-Scope-Manager-Id',
  scopeCoachId: 'X-Scope-Coach-Id',
} as const;
