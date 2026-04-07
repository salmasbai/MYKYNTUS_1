import type { DocumentationRole } from '../interfaces/documentation-role';

const map: Record<DocumentationRole, string> = {
  Pilote: 'pilote',
  Coach: 'coach',
  Manager: 'manager',
  RP: 'rp',
  RH: 'rh',
  Admin: 'admin',
  Audit: 'audit',
};

/** UI (Pilote, Manager, …) → valeur en-tête / API (minuscules). */
export function mapDocumentationRoleToApiRole(role: DocumentationRole): string {
  return map[role];
}
