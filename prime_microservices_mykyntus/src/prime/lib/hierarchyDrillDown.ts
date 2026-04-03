import type { Department, Employee, Role } from '../models';
import { filterByHierarchy } from './orgHierarchy';
import { orgAllowedEmployeeIds } from './organizationScope';

/** Sélection cascade (Manager : coachId seul ; RP : managerId + coachId). */
export interface HierarchyDrillSelection {
  managerId?: string;
  coachId?: string;
}

export function listChildrenByRole(employees: Employee[], parentId: string, childRole: Role): Employee[] {
  return employees.filter((e) => e.parentId === parentId && e.role === childRole);
}

/** Managers directs sous un RP. */
export function listManagersUnderRp(employees: Employee[], rpId: string): Employee[] {
  return listChildrenByRole(employees, rpId, 'Manager');
}

/** Coachs directs sous un Manager. */
export function listCoachesUnderManager(employees: Employee[], managerId: string): Employee[] {
  return listChildrenByRole(employees, managerId, 'Coach');
}

/** Pilotes sous un Coach. */
export function listPilotesUnderCoach(employees: Employee[], coachId: string): Employee[] {
  return listChildrenByRole(employees, coachId, 'Pilote');
}

/** null = drill incomplet ; Set vide = périmètre invalide. */
export function piloteIdsForManagerDrill(
  employees: Employee[],
  managerId: string,
  coachId: string | undefined,
): Set<string> | null {
  if (!coachId) return null;
  const coach = employees.find((e) => e.id === coachId);
  if (!coach || coach.role !== 'Coach' || coach.parentId !== managerId) return new Set();
  return new Set(listPilotesUnderCoach(employees, coachId).map((p) => p.id));
}

/** null = drill incomplet ; Set vide = périmètre invalide. */
export function piloteIdsForRpDrill(
  employees: Employee[],
  rpId: string,
  drill: HierarchyDrillSelection,
): Set<string> | null {
  if (!drill.managerId || !drill.coachId) return null;
  const mgr = employees.find((e) => e.id === drill.managerId);
  const coach = employees.find((e) => e.id === drill.coachId);
  if (!mgr || mgr.role !== 'Manager' || mgr.parentId !== rpId) return new Set();
  if (!coach || coach.role !== 'Coach' || coach.parentId !== drill.managerId) return new Set();
  return new Set(listPilotesUnderCoach(employees, drill.coachId).map((p) => p.id));
}

/**
 * Filtre strict drill-down : aucun accès Pilote sans Coach (Manager) ;
 * aucun accès Pilote/Coach sans Manager + Coach (RP).
 */
export function applyDrillDownToEmployeeRows<T extends { employeeId: string }>(
  rows: T[],
  viewerRole: Role,
  viewerId: string,
  employees: Employee[],
  drill: HierarchyDrillSelection,
  departments: Department[],
): T[] {
  const orgIds = orgAllowedEmployeeIds(viewerRole, viewerId, employees, departments);

  const applyOrg = (filtered: T[]) => {
    if (orgIds === null) return filtered;
    return filtered.filter((r) => orgIds.has(r.employeeId));
  };

  if (viewerRole === 'Admin' || viewerRole === 'RH' || viewerRole === 'Audit') {
    return applyOrg(filterByHierarchy(rows, viewerRole, viewerId, employees));
  }
  if (viewerRole === 'Coach') {
    return applyOrg(filterByHierarchy(rows, viewerRole, viewerId, employees));
  }
  if (viewerRole === 'Pilote') {
    return applyOrg(rows.filter((r) => r.employeeId === viewerId));
  }

  if (viewerRole === 'Manager') {
    const piloteIds = piloteIdsForManagerDrill(employees, viewerId, drill.coachId);
    if (piloteIds === null) return [];
    return applyOrg(rows.filter((r) => piloteIds.has(r.employeeId)));
  }

  if (viewerRole === 'RP') {
    const piloteIds = piloteIdsForRpDrill(employees, viewerId, drill);
    if (piloteIds === null) return [];
    return applyOrg(rows.filter((r) => piloteIds.has(r.employeeId)));
  }

  return applyOrg(filterByHierarchy(rows, viewerRole, viewerId, employees));
}

export function drillSelectOptions(
  employees: Employee[],
  viewerRole: Role,
  viewerId: string,
  drill: HierarchyDrillSelection,
): { managers: { value: string; label: string }[]; coaches: { value: string; label: string }[] } {
  const labelOf = (e: Employee) => `${e.firstName} ${e.lastName}`;
  const managers =
    viewerRole === 'RP' ? listManagersUnderRp(employees, viewerId).map((e) => ({ value: e.id, label: labelOf(e) })) : [];
  const coachesForManager =
    viewerRole === 'Manager'
      ? listCoachesUnderManager(employees, viewerId).map((e) => ({ value: e.id, label: labelOf(e) }))
      : viewerRole === 'RP' && drill.managerId
        ? listCoachesUnderManager(employees, drill.managerId).map((e) => ({ value: e.id, label: labelOf(e) }))
        : [];
  return { managers, coaches: coachesForManager };
}
