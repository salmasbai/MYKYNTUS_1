/** Répertoire démo (affichage settings / docs) — pas de logique métier. */
export const MOCK_DEPARTMENTS = [
  { id: 'dept-1', name: 'Digital & Produits' },
  { id: 'dept-2', name: 'Ressources Humaines' },
  { id: 'dept-3', name: 'Infrastructure & Cloud' },
];

export const MOCK_PROJECTS = [
  { id: 'proj-1', name: 'Alpha Digital', departmentId: 'dept-1' },
  { id: 'proj-2', name: 'Beta Ops', departmentId: 'dept-2' },
  { id: 'proj-3', name: 'Gamma Cloud', departmentId: 'dept-3' },
];

/** Libellés pour les identifiants organisationnels (démo). */
export const MOCK_ORG_LABELS = {
  departments: {
    'dept-1': 'Digital & Produits',
    'dept-2': 'Ressources Humaines',
    'dept-3': 'Infrastructure & Cloud',
  } as Record<string, string>,
  poles: {
    'pole-1': 'Pôle Produits & Parrainage',
    'pole-rh': 'Pôle Ressources humaines',
  } as Record<string, string>,
  cellules: {
    'cell-1': 'Cellule Opérationnelle',
    'cell-rh': 'Cellule RH',
  } as Record<string, string>,
  /** Équipe unique pour la branche démo principale. */
  defaultTeam: 'Équipe MyKyntus',
} as const;

export const MOCK_USERS_BY_ROLE = {
  PILOTE: [
    { id: 'emp-1', name: 'Jean Dupont', email: 'jean.dupont@mykyntus.com' },
    { id: 'emp-2', name: 'Sophie Leroy', email: 'sophie.leroy@mykyntus.com' },
    { id: 'emp-3', name: 'Thomas Bernard', email: 'thomas.bernard@mykyntus.com' },
    { id: 'emp-4', name: 'Julie Moreau', email: 'julie.moreau@mykyntus.com' },
    { id: 'emp-5', name: 'Karim Benali', email: 'karim.benali@mykyntus.com' },
  ],
  RH: [
    { id: 'rh-1', name: 'Camille Rousseau', email: 'camille.rousseau@mykyntus.com' },
    { id: 'rh-2', name: 'David Petit', email: 'david.petit@mykyntus.com' },
    { id: 'rh-3', name: 'Emma Blanc', email: 'emma.blanc@mykyntus.com' },
    { id: 'rh-4', name: 'François Noir', email: 'francois.noir@mykyntus.com' },
    { id: 'rh-5', name: 'Gaëlle Vert', email: 'gaelle.vert@mykyntus.com' },
  ],
  ADMIN: [
    { id: 'admin-1', name: 'Administrateur démo', email: 'admin@mykyntus.com' },
    { id: 'admin-2', name: 'Ops Nord', email: 'ops.nord@mykyntus.com' },
    { id: 'admin-3', name: 'Ops Sud', email: 'ops.sud@mykyntus.com' },
    { id: 'admin-4', name: 'SRE Lead', email: 'sre@mykyntus.com' },
    { id: 'admin-5', name: 'Support L3', email: 'support.l3@mykyntus.com' },
  ],
  COACH: [
    { id: 'coach-1', name: 'Marc Lefèvre', email: 'coach@mykyntus.com' },
    { id: 'coach-2', name: 'Laura Petit', email: 'laura.petit@mykyntus.com' },
  ],
  MANAGER: [
    { id: 'mgr-1', name: 'Charlie Durand', email: 'manager@mykyntus.com', projectId: 'proj-1' },
    { id: 'mgr-2', name: 'Pierre Girard', email: 'pierre.girard@mykyntus.com', projectId: 'proj-2' },
    { id: 'mgr-3', name: 'Nora Said', email: 'nora.said@mykyntus.com', projectId: 'proj-3' },
  ],
  RP: [
    { id: 'rp-1', name: 'Rachid El Amrani', email: 'rp@mykyntus.com' },
    { id: 'rp-2', name: 'Inès Karim', email: 'ines.karim@mykyntus.com' },
  ],
} as const;
