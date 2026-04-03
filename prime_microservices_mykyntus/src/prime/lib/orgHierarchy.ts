import type { Employee, Role } from '../models';

/**
 * Hiérarchie stricte : Pilote → Coach → Manager → RP (RP = sommet).
 * RH, Admin, Audit : pas de filtrage ici (visibilité complète côté appelant).
 */
export function isTargetUnderViewerInChain(
  viewerId: string,
  targetEmployeeId: string,
  employees: Employee[],
): boolean {
  if (viewerId === targetEmployeeId) return true;
  let cur = employees.find((e) => e.id === targetEmployeeId);
  const guard = new Set<string>();
  while (cur?.parentId) {
    if (cur.parentId === viewerId) return true;
    if (guard.has(cur.id)) break;
    guard.add(cur.id);
    cur = employees.find((e) => e.id === cur.parentId);
  }
  return false;
}

export function employeeVisibleToHierarchyRole(
  viewerRole: Role,
  viewerId: string,
  targetEmployeeId: string,
  employees: Employee[],
): boolean {
  if (viewerRole === 'Admin' || viewerRole === 'RH' || viewerRole === 'Audit') {
    return true;
  }
  if (viewerRole === 'RP') {
    return true;
  }
  if (viewerRole === 'Manager' || viewerRole === 'Coach') {
    return isTargetUnderViewerInChain(viewerId, targetEmployeeId, employees);
  }
  if (viewerRole === 'Pilote') {
    return viewerId === targetEmployeeId;
  }
  return true;
}

export function filterByHierarchy<T extends { employeeId: string }>(
  rows: T[],
  viewerRole: Role,
  viewerId: string,
  employees: Employee[],
): T[] {
  return rows.filter((r) =>
    employeeVisibleToHierarchyRole(viewerRole, viewerId, r.employeeId, employees),
  );
}
