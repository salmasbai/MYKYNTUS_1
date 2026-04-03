import type { Department, Employee, Role } from '../models';

/** Hiérarchie organisationnelle : Département → Pôle → Cellule (équipe = teamId côté collaborateur). */
export interface Organization {
  departementId: string;
  poleId: string;
  celluleId: string;
}

export function organizationOfEmployee(e: Employee, departments: Department[]): Organization | null {
  if (e.departementId && e.poleId && e.celluleId) {
    return { departementId: e.departementId, poleId: e.poleId, celluleId: e.celluleId };
  }
  return resolveOrganizationFromTeam(e.teamId, departments);
}

export function resolveOrganizationFromTeam(teamId: string, departments: Department[]): Organization | null {
  for (const d of departments) {
    for (const p of d.poles) {
      for (const c of p.cells) {
        for (const t of c.teams) {
          if (t.id === teamId) {
            return { departementId: d.id, poleId: p.id, celluleId: c.id };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Identifiants collaborateurs autorisés par le périmètre organisationnel (sans hiérarchie métier).
 * null = pas de restriction supplémentaire (RH / Admin / Audit : périmètre global sur le jeu de données).
 */
export function orgAllowedEmployeeIds(
  viewerRole: Role,
  viewerId: string,
  employees: Employee[],
  departments: Department[],
): Set<string> | null {
  const viewer = employees.find((e) => e.id === viewerId);
  if (!viewer) return new Set();

  if (viewerRole === 'Admin' || viewerRole === 'RH' || viewerRole === 'Audit') {
    return null;
  }

  if (viewerRole === 'Pilote') {
    return new Set([viewerId]);
  }

  const viewerOrg = organizationOfEmployee(viewer, departments);
  if (!viewerOrg) return new Set();

  const ids = new Set<string>();
  for (const e of employees) {
    const o = organizationOfEmployee(e, departments);
    if (!o) continue;
    if (viewerRole === 'Coach' && o.celluleId === viewerOrg.celluleId) ids.add(e.id);
    if (viewerRole === 'Manager' && o.poleId === viewerOrg.poleId) ids.add(e.id);
    if (viewerRole === 'RP' && o.departementId === viewerOrg.departementId) ids.add(e.id);
  }
  return ids;
}

export function intersectNullableEmployeeSets(a: Set<string> | null, b: Set<string> | null): Set<string> | null {
  if (a === null && b === null) return null;
  if (a === null) return b;
  if (b === null) return a;
  return new Set([...a].filter((id) => b.has(id)));
}
