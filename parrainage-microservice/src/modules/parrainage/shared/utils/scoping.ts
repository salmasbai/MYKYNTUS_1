import type { Referral } from '../../core/models/Referral';
import {
  ORG_NODES,
  isReferrerUnderManager,
  piloteIdsForManagerDrill,
  piloteIdsForRpDrill,
  type HierarchyDrillSelection,
  type OrgNode,
} from './orgHierarchy';

export type Role = 'RH' | 'PILOTE' | 'ADMIN' | 'MANAGER' | 'COACH' | 'RP' | 'AUDIT';

export type { HierarchyDrillSelection } from './orgHierarchy';

export interface UserForScoping {
  id: string;
  role: Role;
  /** Lien hiérarchique (supérieur direct). */
  parentId?: string;
  projectId?: string;
  departmentId?: string;
  poleId?: string;
  celluleId?: string;
}

function orgAllowedReferrerIds(user: UserForScoping, nodes: OrgNode[]): Set<string> | null {
  if (user.role === 'ADMIN' || user.role === 'RH' || user.role === 'AUDIT') return null;
  const viewer = nodes.find((n) => n.id === user.id);
  if (!viewer) return new Set();
  if (user.role === 'PILOTE') return new Set([user.id]);
  const ids = new Set<string>();
  for (const n of nodes) {
    if (user.role === 'COACH' && n.celluleId === viewer.celluleId) ids.add(n.id);
    if (user.role === 'MANAGER' && n.poleId === viewer.poleId) ids.add(n.id);
    if (user.role === 'RP' && n.departementId === viewer.departementId) ids.add(n.id);
  }
  return ids;
}

/**
 * Filtrage métier ∩ organisation : drill strict Manager/RP, Coach (descendants dans la cellule),
 * Pilote, RH/Admin/Audit (périmètre global sur le jeu de données).
 */
export function getScopedReferrals(
  referrals: Referral[],
  user: UserForScoping | null | undefined,
  drill: HierarchyDrillSelection = {},
): Referral[] {
  if (!user) return [];

  let result: Referral[];
  switch (user.role) {
    case 'ADMIN':
    case 'RH':
    case 'AUDIT':
      result = referrals;
      break;
    case 'RP': {
      const piloteIds = piloteIdsForRpDrill(ORG_NODES, user.id, drill);
      if (piloteIds === null) {
        result = [];
        break;
      }
      result = referrals.filter((r) => piloteIds.has(r.referrerId));
      break;
    }
    case 'MANAGER': {
      const piloteIds = piloteIdsForManagerDrill(ORG_NODES, user.id, drill.coachId);
      if (piloteIds === null) {
        result = [];
        break;
      }
      result = referrals.filter((r) => piloteIds.has(r.referrerId));
      break;
    }
    case 'COACH':
      result = referrals.filter((r) => isReferrerUnderManager(user.id, r.referrerId));
      break;
    case 'PILOTE':
      result = referrals.filter((r) => r.referrerId === user.id);
      break;
    default:
      result = [];
  }

  const orgIds = orgAllowedReferrerIds(user, ORG_NODES);
  if (orgIds === null) return result;
  return result.filter((r) => orgIds.has(r.referrerId));
}
