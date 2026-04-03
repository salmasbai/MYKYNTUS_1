import type { Role } from '../types';
import {
  demoUserIdForRole,
  visibleEmployeeIdsForRole,
  type HierarchyDrillSelection,
} from './documentationOrgHierarchy';

export function filterByEmployeeScope<T extends { employeeId?: string }>(
  items: T[],
  role: Role,
  drill?: HierarchyDrillSelection,
): T[] {
  const uid = demoUserIdForRole(role);
  const allowed = visibleEmployeeIdsForRole(role, uid, drill ?? {});
  if (allowed === null) return items;
  return items.filter((i) => i.employeeId && allowed.has(i.employeeId));
}
