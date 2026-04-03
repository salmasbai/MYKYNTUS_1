import type { Role } from '../types';
import { ORG_PEOPLE, demoUserIdForRole } from './documentationOrgHierarchy';

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

const USER_DISPLAY_NAME: Record<Role, string> = {
  Pilote: 'Employe Pilote',
  Coach: 'Coach terrain',
  RH: 'Responsable RH',
  Admin: 'Administrateur',
  Manager: 'Manager',
  Audit: 'Auditeur',
  RP: 'Responsable Projet',
};

export function formatOrgCompactLine(organizational: { departement: string; pole: string; cellule: string }): string {
  return [organizational.departement, organizational.pole, organizational.cellule]
    .filter((v) => v && v.trim() !== '' && v !== '—')
    .join(' • ');
}

export function getPersonalOrgLabelsForRole(role: Role): PersonalOrgLabels {
  const uid = demoUserIdForRole(role);
  const person = ORG_PEOPLE.find((p) => p.id === uid);
  const employeeName = USER_DISPLAY_NAME[role] ?? '—';
  if (!person) {
    return {
      employeeName,
      departement: '—',
      pole: '—',
      cellule: '—',
      equipe: '—',
    };
  }
  return {
    employeeName,
    departement: DEPT_NAMES[person.departementId] ?? '—',
    pole: POLE_NAMES[person.poleId] ?? '—',
    cellule: CELL_NAMES[person.celluleId] ?? '—',
    equipe: TEAM_NAMES[person.teamId] ?? '—',
  };
}
