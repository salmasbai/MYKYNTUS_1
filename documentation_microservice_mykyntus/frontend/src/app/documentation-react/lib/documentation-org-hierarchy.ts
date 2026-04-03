import type { DocumentationRole } from '../interfaces/documentation-role';

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

/** Identifiants alignés sur le seed PostgreSQL / DemoActors du backend (pas de données UI fictives). */
export const ORG_DEMO_IDS = {
  pilote: '11111111-1111-4111-8111-111111111101',
  pilote2: '11111111-1111-4111-8111-111111111102',
  pilote3: '11111111-1111-4111-8111-111111111103',
  pilote4: '11111111-1111-4111-8111-111111111104',
  coach: '55555555-5555-4555-8555-555555555501',
  manager: '22222222-2222-4222-8222-222222222201',
  rp: '66666666-6666-4666-8666-666666666601',
} as const;

const TEAM_DOC_ID = 'team-doc-1';

export interface OrgPerson {
  id: string;
  role: 'Pilote' | 'Coach' | 'Manager' | 'RP';
  parentId?: string;
  departementId: string;
  poleId: string;
  celluleId: string;
  teamId: string;
}

export const ORG_PEOPLE: OrgPerson[] = [
  { id: ORG_DEMO_IDS.rp, role: 'RP', ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.manager, role: 'Manager', parentId: ORG_DEMO_IDS.rp, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.coach, role: 'Coach', parentId: ORG_DEMO_IDS.manager, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.pilote, role: 'Pilote', parentId: ORG_DEMO_IDS.coach, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.pilote2, role: 'Pilote', parentId: ORG_DEMO_IDS.coach, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.pilote3, role: 'Pilote', parentId: ORG_DEMO_IDS.coach, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
  { id: ORG_DEMO_IDS.pilote4, role: 'Pilote', parentId: ORG_DEMO_IDS.coach, ...DOC_ORG_DEMO, teamId: TEAM_DOC_ID },
];

const PERSON_LABEL: Record<string, string> = {
  [ORG_DEMO_IDS.rp]: 'RP',
  [ORG_DEMO_IDS.manager]: 'Manager',
  [ORG_DEMO_IDS.coach]: 'Coach',
  [ORG_DEMO_IDS.pilote]: 'Yasmine El Amrani',
  [ORG_DEMO_IDS.pilote2]: 'Omar Benali',
  [ORG_DEMO_IDS.pilote3]: 'Salma Idrissi',
  [ORG_DEMO_IDS.pilote4]: 'Ahmed Ouazzani',
};

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
  role: DocumentationRole,
  viewerPersonId: string,
  drill: HierarchyDrillSelection,
): { managers: { value: string; label: string }[]; coaches: { value: string; label: string }[] } {
  const labelOf = (p: OrgPerson) => PERSON_LABEL[p.id] ?? p.id;
  const managers =
    role === 'RP'
      ? listManagersUnderRp(ORG_PEOPLE, viewerPersonId).map((p) => ({ value: p.id, label: labelOf(p) }))
      : [];
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

export function orgAllowedPersonIds(role: DocumentationRole, viewerPersonId: string): Set<string> | null {
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
    const parentId = cur.parentId;
    if (parentId === viewerId) return true;
    if (guard.has(cur.id)) break;
    guard.add(cur.id);
    cur = people.find((p) => p.id === parentId);
  }
  return false;
}

export function visibleEmployeeIdsForRole(
  role: DocumentationRole,
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

export function demoUserIdForRole(role: DocumentationRole): string {
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
      return ORG_DEMO_IDS.pilote;
  }
}
