import type { User } from '../../../frontend/app/providers/AuthProvider';
import { MOCK_ORG_LABELS } from '../../modules/parrainage/features/mockData/directory';

export interface PersonalOrgLabels {
  employeeName: string;
  departement: string;
  pole: string;
  cellule: string;
  equipe: string;
}

export function formatOrgCompactLine(organizational: { departement: string; pole: string; cellule: string }): string {
  return [organizational.departement, organizational.pole, organizational.cellule]
    .filter((v) => v && v.trim() !== '' && v !== '—')
    .join(' • ');
}

export function getParrainagePersonalOrgLabels(user: User | null): PersonalOrgLabels {
  if (!user) {
    return { employeeName: '—', departement: '—', pole: '—', cellule: '—', equipe: '—' };
  }
  const dep = user.departmentId ? MOCK_ORG_LABELS.departments[user.departmentId] : undefined;
  const pol = user.poleId ? MOCK_ORG_LABELS.poles[user.poleId] : undefined;
  const cell = user.celluleId ? MOCK_ORG_LABELS.cellules[user.celluleId] : undefined;
  return {
    employeeName: user.name,
    departement: dep ?? '—',
    pole: pol ?? '—',
    cellule: cell ?? '—',
    equipe: MOCK_ORG_LABELS.defaultTeam,
  };
}
