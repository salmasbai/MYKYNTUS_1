/** Données d’affichage / filtres audit uniquement (pas de logique métier). */

export type AuditRoleFilter = 'RP' | 'Manager' | 'Coach' | 'Pilote';

export interface AuditOrgDimensions {
  departement: string;
  pole: string;
  cellule: string;
  roleMetier: AuditRoleFilter;
}

const ORG: Array<{ dept: string; poles: Array<{ name: string; cellules: string[] }> }> = [
  {
    dept: 'RH',
    poles: [
      { name: 'Talent', cellules: ['Recrutement', 'Formation'] },
      { name: 'Relations sociales', cellules: ['Dialogue', 'Représentation'] },
    ],
  },
  {
    dept: 'Finance',
    poles: [
      { name: 'Comptabilité', cellules: ['Paie', 'Clôture'] },
      { name: 'Contrôle', cellules: ['Audit interne', 'Conformité'] },
    ],
  },
  {
    dept: 'Opérations',
    poles: [
      { name: 'Projets', cellules: ['Delivery', 'Support'] },
      { name: 'Infrastructure', cellules: ['Réseau', 'Sécurité'] },
    ],
  },
];

const ROLES: AuditRoleFilter[] = ['RP', 'Manager', 'Coach', 'Pilote'];

export function getAuditOrgTree() {
  return ORG;
}

export function enrichAuditRowFromId(id: string): AuditOrgDimensions {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i) | 0;
  const u = h >>> 0;
  const d = ORG[u % ORG.length];
  const p = d.poles[(u >> 8) % d.poles.length];
  const c = p.cellules[(u >> 16) % p.cellules.length];
  const r = ROLES[(u >> 4) % ROLES.length];
  return { departement: d.dept, pole: p.name, cellule: c, roleMetier: r };
}
