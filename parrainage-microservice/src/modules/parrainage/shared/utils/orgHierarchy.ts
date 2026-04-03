/** Département → Pôle → Cellule → (équipe / parrain). */
export interface Organization {
  departementId: string;
  poleId: string;
  celluleId: string;
}

export interface OrgNode extends Organization {
  id: string;
  parentId?: string;
}

const PARR_ORG: Organization = { departementId: 'dept-1', poleId: 'pole-1', celluleId: 'cell-1' };

/**
 * Chaîne : Pilote → Coach → Manager → RP (sommet).
 * Identifiants alignés sur les parrains (referrerId) des jeux de démo.
 */
export const ORG_NODES: OrgNode[] = [
  { id: 'rp-1', ...PARR_ORG },
  { id: 'mgr-1', parentId: 'rp-1', ...PARR_ORG },
  { id: 'coach-1', parentId: 'mgr-1', ...PARR_ORG },
  { id: 'emp-1', parentId: 'coach-1', ...PARR_ORG },
  { id: 'emp-2', parentId: 'coach-1', ...PARR_ORG },
  { id: 'emp-3', parentId: 'coach-1', ...PARR_ORG },
  { id: 'emp-4', parentId: 'coach-1', ...PARR_ORG },
  { id: 'emp-5', parentId: 'coach-1', ...PARR_ORG },
];

export function isReferrerUnderManager(viewerId: string, referrerId: string): boolean {
  if (viewerId === referrerId) return true;
  let cur = ORG_NODES.find((n) => n.id === referrerId);
  const guard = new Set<string>();
  while (cur?.parentId) {
    if (cur.parentId === viewerId) return true;
    if (guard.has(cur.id)) break;
    guard.add(cur.id);
    cur = ORG_NODES.find((n) => n.id === cur!.parentId);
  }
  return false;
}

export interface HierarchyDrillSelection {
  managerId?: string;
  coachId?: string;
}

export function listManagersUnderRp(nodes: Array<{ id: string; parentId?: string }>, rpId: string) {
  return nodes.filter((n) => n.parentId === rpId && n.id.startsWith('mgr-'));
}

export function listCoachesUnderManager(nodes: Array<{ id: string; parentId?: string }>, managerId: string) {
  return nodes.filter((n) => n.parentId === managerId && n.id.startsWith('coach-'));
}

function piloteIdsUnderCoach(nodes: Array<{ id: string; parentId?: string }>, coachId: string): Set<string> {
  return new Set(nodes.filter((n) => n.parentId === coachId && n.id.startsWith('emp-')).map((n) => n.id));
}

/** null = drill incomplet (aucune donnée pilote) ; Set vide = périmètre invalide. */
export function piloteIdsForManagerDrill(
  nodes: Array<{ id: string; parentId?: string }>,
  managerId: string,
  coachId: string | undefined,
): Set<string> | null {
  if (!coachId) return null;
  const coach = nodes.find((n) => n.id === coachId);
  if (!coach || coach.parentId !== managerId) return new Set();
  return piloteIdsUnderCoach(nodes, coachId);
}

export function piloteIdsForRpDrill(
  nodes: Array<{ id: string; parentId?: string }>,
  rpId: string,
  drill: HierarchyDrillSelection,
): Set<string> | null {
  if (!drill.managerId || !drill.coachId) return null;
  const mgr = nodes.find((n) => n.id === drill.managerId);
  const coach = nodes.find((n) => n.id === drill.coachId);
  if (!mgr || mgr.parentId !== rpId) return new Set();
  if (!coach || coach.parentId !== drill.managerId) return new Set();
  return piloteIdsUnderCoach(nodes, drill.coachId);
}
