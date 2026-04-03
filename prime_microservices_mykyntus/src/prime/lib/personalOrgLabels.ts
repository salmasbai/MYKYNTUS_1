import type { Department, Employee } from '../models';

export interface PersonalOrgLabels {
  employeeName: string;
  departement: string;
  pole: string;
  cellule: string;
  equipe: string;
}

/** Libellés affichables (Département → Pôle → Cellule → Équipe) à partir du collaborateur et du référentiel. */
/** Une ligne « Département • Pôle • Cellule » (valeurs uniquement, segments vides omis). */
export function formatOrgCompactLine(organizational: { departement: string; pole: string; cellule: string }): string {
  return [organizational.departement, organizational.pole, organizational.cellule]
    .filter((v) => v && v.trim() !== '' && v !== '—')
    .join(' • ');
}

export function getPersonalOrgLabels(employee: Employee, departments: Department[]): PersonalOrgLabels {
  const dept = departments.find((d) => d.id === employee.departementId);
  const pole = dept?.poles.find((p) => p.id === employee.poleId);
  const cell = pole?.cells.find((c) => c.id === employee.celluleId);
  const team = cell?.teams.find((t) => t.id === employee.teamId);
  return {
    employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    departement: dept?.name ?? '—',
    pole: pole?.name ?? '—',
    cellule: cell?.name ?? '—',
    equipe: team?.name ?? '—',
  };
}
