import type { Role } from '../types';

/** Département → Pôle → Cellule (équipe = rattachement le plus fin côté données). */
export interface Organization {
  departementId: string;
  poleId: string;
  celluleId: string;
}

const DOC_ORG_DEMO: Organization = {
  departementId: 'dept-doc-1',
  poleId: 'pole-doc-1',
  celluleId: 'cell-doc-1',
};

/** Identités de démo alignées sur la chaîne Pilote → Coach → Manager → RP. */
export const ORG_DEMO_IDS = {
  pilote: 'u-pilote-1',
  pilote2: 'u-pilote-2',
  coach: 'u-coach-1',
  manager: 'u-manager-1',
  rp: 'u-rp-1',
} as const;

const TEAM_DOC_ID = 'team-doc-1';

export interface OrgPerson {
  id: string;
  role: 'Pilote' | 'Coach' | 'Manager' | 'RP';
  parentId?: string;
  departementId: string;
  poleId: string;
  celluleId: string;
  /** Équipe (rattachement opérationnel). */
  teamId: string;
}

export const ORG_PEOPLE: OrgPerson[] = [
  { id: ORG_DEMO_IDS.rp, role: 'RP', ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.manager, role: 'Manager', parentId: ORG_DEMO_IDS.rp, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.coach, role: 'Coach', parentId: ORG_DEMO_IDS.manager, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.pilote, role: 'Pilote', parentId: ORG_DEMO_IDS.coach, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.pilote2, role: 'Pilote', parentId: ORG_DEMO_IDS.coach, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
];

const PERSON_LABEL: Record<string, string> = {
  [ORG_DEMO_IDS.rp]: 'RP',
  [ORG_DEMO_IDS.manager]: 'Manager',
  [ORG_DEMO_IDS.coach]: 'Coach',
  [ORG_DEMO_IDS.pilote]: 'Collaborateur 1',
  [ORG_DEMO_IDS.pilote2]: 'Collaborateur 2',
};

/** Sélection cascade (Manager : coachId ; RP : managerId + coachId). */
export interface HierarchyDrillSelection {
  managerId?: string;
  coachId?: string;
}

export function listManagersUnderRp(people: OrgPerson[], rpId: string): OrgPerson[] {
  return people.filter((p) => p.role === 'Manager' && p.parentId === rpId);
}

export function listCoachesUnderManager(people: OrgPerson[], managerId: string): OrgPerson[] {
  return people.filter((p) => p.role === 'Coach' && p.parentId === managerId);
}

export function listPilotesUnderCoach(people: OrgPerson[], coachId: string): OrgPerson[] {
  return people.filter((p) => p.role === 'Pilote' && p.parentId === coachId);
}

/** null = drill incomplet ; Set vide = périmètre invalide. */
export function piloteIdsForManagerDrill(
  people: OrgPerson[],
  managerId: string,
  coachId: string | undefined,
): Set<string> | null {
  if (!coachId) return null;
  const coach = people.find((p) => p.id === coachId);
  if (!coach || coach.role !== 'Coach' || coach.parentId !== managerId) return new Set();
  return new Set(listPilotesUnderCoach(people, coachId).map((p) => p.id));
}

/** null = drill incomplet ; Set vide = périmètre invalide. */
export function piloteIdsForRpDrill(
  people: OrgPerson[],
  rpId: string,
  drill: HierarchyDrillSelection,
): Set<string> | null {
  if (!drill.managerId || !drill.coachId) return null;
  const mgr = people.find((p) => p.id === drill.managerId);
  const coach = people.find((p) => p.id === drill.coachId);
  if (!mgr || mgr.role !== 'Manager' || mgr.parentId !== rpId) return new Set();
  if (!coach || coach.role !== 'Coach' || coach.parentId !== drill.managerId) return new Set();
  return new Set(listPilotesUnderCoach(people, drill.coachId).map((p) => p.id));
}

export function drillSelectOptions(
  role: Role,
  viewerPersonId: string,
  drill: HierarchyDrillSelection,
): { managers: { value: string; label: string }[]; coaches: { value: string; label: string }[] } {
  const labelOf = (p: OrgPerson) => PERSON_LABEL[p.id] ?? p.id;
  const managers =
    role === 'RP' ? listManagersUnderRp(ORG_PEOPLE, viewerPersonId).map((p) => ({ value: p.id, label: labelOf(p) })) : [];
  const coaches =
    role === 'Manager'
      ? listCoachesUnderManager(ORG_PEOPLE, viewerPersonId).map((p) => ({ value: p.id, label: labelOf(p) }))
      : role === 'RP' && drill.managerId
        ? listCoachesUnderManager(ORG_PEOPLE, drill.managerId).map((p) => ({ value: p.id, label: labelOf(p) }))
        : [];
  return { managers, coaches };
}

function intersectNullableSets(a: Set<string> | null, b: Set<string> | null): Set<string> | null {
  if (a === null && b === null) return null;
  if (a === null) return b;
  if (b === null) return a;
  return new Set([...a].filter((id) => b!.has(id)));
}

/** Périmètre organisationnel (sans hiérarchie métier). null = pas de restriction (RH / Admin / Audit). */
export function orgAllowedPersonIds(role: Role, viewerPersonId: string): Set<string> | null {
  if (role === 'RH' || role === 'Admin' || role === 'Audit') return null;
  const viewer = ORG_PEOPLE.find((p) => p.id === viewerPersonId);
  if (!viewer) return new Set();
  if (role === 'Pilote') return new Set([viewerPersonId]);

  const ids = new Set<string>();
  for (const p of ORG_PEOPLE) {
    if (role === 'Coach' && p.celluleId === viewer.celluleId) ids.add(p.id);
    if (role === 'Manager' && p.poleId === viewer.poleId) ids.add(p.id);
    if (role === 'RP' && p.departementId === viewer.departementId) ids.add(p.id);
  }
  return ids;
}

function isUnderViewer(viewerId: string, targetEmployeeId: string, people: OrgPerson[]): boolean {
  if (viewerId === targetEmployeeId) return true;
  let cur = people.find((p) => p.id === targetEmployeeId);
  const guard = new Set<string>();
  while (cur?.parentId) {
    if (cur.parentId === viewerId) return true;
    if (guard.has(cur.id)) break;
    guard.add(cur.id);
    cur = people.find((p) => p.id === cur.parentId);
  }
  return false;
}

/** RH, Admin, Audit : pas de filtrage métier (null = tout). Intersection avec le périmètre organisationnel. */
export function visibleEmployeeIdsForRole(
  role: Role,
  viewerPersonId: string,
  drill: HierarchyDrillSelection = {},
): Set<string> | null {
  const orgIds = orgAllowedPersonIds(role, viewerPersonId);

  let business: Set<string> | null = null;

  if (role === 'RH' || role === 'Admin' || role === 'Audit') {
    business = null;
  } else if (role === 'Pilote') {
    business = new Set([viewerPersonId]);
  } else if (role === 'Coach') {
    const out = new Set<string>();
    for (const p of ORG_PEOPLE) {
      if (isUnderViewer(viewerPersonId, p.id, ORG_PEOPLE)) out.add(p.id);
    }
    out.add(viewerPersonId);
    business = out;
  } else if (role === 'Manager') {
    const piloteIds = piloteIdsForManagerDrill(ORG_PEOPLE, viewerPersonId, drill.coachId);
    if (piloteIds === null) return new Set();
    business = piloteIds;
  } else if (role === 'RP') {
    const piloteIds = piloteIdsForRpDrill(ORG_PEOPLE, viewerPersonId, drill);
    if (piloteIds === null) return new Set();
    business = piloteIds;
  } else {
    business = null;
  }

  return intersectNullableSets(business, orgIds);
}

export function demoUserIdForRole(role: Role): string {
  switch (role) {
    case 'Pilote':
      return ORG_DEMO_IDS.pilote;
    case 'Coach':
      return ORG_DEMO_IDS.coach;
    case 'Manager':
      return ORG_DEMO_IDS.manager;
    case 'RP':
      return ORG_DEMO_IDS.rp;
    default:
      return 'u-generic';
  }
}
