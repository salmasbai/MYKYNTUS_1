import type { DocumentationRole } from '../interfaces/documentation-role';

/** Côté API les rôles sont en minuscules (enum PostgreSQL / en-têtes). */
export function mapApiRoleToDocumentationRole(api: string): DocumentationRole {
  const key = api.trim().toLowerCase();
  const map: Record<string, DocumentationRole> = {
    pilote: 'Pilote',
    coach: 'Coach',
    manager: 'Manager',
    rp: 'RP',
    rh: 'RH',
    admin: 'Admin',
    audit: 'Audit',
  };
  const role = map[key];
  if (!role) {
    throw new Error(`Rôle API inconnu : ${api}`);
  }
  return role;
}
