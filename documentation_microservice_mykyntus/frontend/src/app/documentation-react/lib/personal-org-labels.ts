import type { DocumentationRole } from '../interfaces/documentation-role';
import { ORG_PEOPLE, demoUserIdForRole } from './documentation-org-hierarchy';

export interface PersonalOrgLabels {
  employeeName: string;
  departement: string;
  pole: string;
  cellule: string;
  equipe: string;
}

const DEPT_NAMES: Record<string, string> = {
  'dept-doc-1': 'Opérations & Qualité',
};

const POLE_NAMES: Record<string, string> = {
  'pole-doc-1': 'Pôle Documentation',
};

const CELL_NAMES: Record<string, string> = {
  'cell-doc-1': 'Cellule Conformité',
};

const TEAM_NAMES: Record<string, string> = {
  'team-doc-1': 'Équipe Documents',
};

/**
 * Structure organisationnelle (démo) pour un utilisateur annuaire (UUID) ou repli par rôle UI.
 * Le nom affiché vient du profil API (GET /users/me), pas de cet aide-mémoire.
 */
export function getPersonalOrgLabelsForViewer(
  userId: string | undefined,
  role: DocumentationRole,
): PersonalOrgLabels {
  const person =
    (userId ? ORG_PEOPLE.find((p) => p.id === userId) : undefined) ??
    ORG_PEOPLE.find((p) => p.id === demoUserIdForRole(role));
  if (!person) {
    return {
      employeeName: '',
      departement: '—',
      pole: '—',
      cellule: '—',
      equipe: '—',
    };
  }
  return {
    employeeName: '',
    departement: DEPT_NAMES[person.departementId] ?? '—',
    pole: POLE_NAMES[person.poleId] ?? '—',
    cellule: CELL_NAMES[person.celluleId] ?? '—',
    equipe: TEAM_NAMES[person.teamId] ?? '—',
  };
}

export function formatOrgCompactLine(organizational: {
  departement: string;
  pole: string;
  cellule: string;
}): string {
  return [organizational.departement, organizational.pole, organizational.cellule]
    .filter((v) => v && v.trim() !== '' && v !== '—')
    .join(' • ');
}
