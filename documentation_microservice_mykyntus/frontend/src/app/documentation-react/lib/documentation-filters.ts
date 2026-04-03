import type { DocumentationRole } from '../interfaces/documentation-role';
import {
  demoUserIdForRole,
  visibleEmployeeIdsForRole,
  type HierarchyDrillSelection,
} from './documentation-org-hierarchy';

export function filterByEmployeeScope<T extends { employeeId?: string }>(
  items: T[],
  role: DocumentationRole,
  drill?: HierarchyDrillSelection,
): T[] {
  const uid = demoUserIdForRole(role);
  const allowed = visibleEmployeeIdsForRole(role, uid, drill ?? {});
  if (allowed === null) return items;
  return items.filter((i) => i.employeeId && allowed.has(i.employeeId));
}

export type { HierarchyDrillSelection };
