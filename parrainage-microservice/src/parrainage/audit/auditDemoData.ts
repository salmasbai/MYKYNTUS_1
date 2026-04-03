/** Données de démo — historique d’accès (sécurité / login uniquement). */
export type AccessEventType = 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'SUSPICIOUS';

export interface AccessLogRow {
  id: string;
  user: string;
  datetime: string;
  ip: string;
  location: string;
  success: boolean;
  eventType: AccessEventType;
  /** ex. Login, Logout */
  label: string;
  detail?: string;
  /** Dérivé : alerte brute force / sécurité */
  securityFlag?: 'NONE' | 'WARNING';
}

/** Démo : plusieurs échecs rapprochés pour le même compte → WARNING */
export const ACCESS_LOG_DEMO: AccessLogRow[] = [
  {
    id: 'acc-0a',
    user: 'sophie.leroy@mykyntus.com',
    datetime: '2026-03-30 09:16:05',
    ip: '105.66.12.99',
    location: 'Casablanca, MA',
    success: false,
    eventType: 'LOGIN_FAILURE',
    label: 'Connexion',
    detail: 'Mot de passe invalide',
  },
  {
    id: 'acc-0b',
    user: 'sophie.leroy@mykyntus.com',
    datetime: '2026-03-30 09:16:22',
    ip: '105.66.12.99',
    location: 'Casablanca, MA',
    success: false,
    eventType: 'LOGIN_FAILURE',
    label: 'Connexion',
    detail: 'Mot de passe invalide',
  },
  {
    id: 'acc-0c',
    user: 'sophie.leroy@mykyntus.com',
    datetime: '2026-03-30 09:16:38',
    ip: '105.66.12.99',
    location: 'Casablanca, MA',
    success: false,
    eventType: 'LOGIN_FAILURE',
    label: 'Connexion',
    detail: 'Mot de passe invalide',
  },
  {
    id: 'acc-0d',
    user: 'sophie.leroy@mykyntus.com',
    datetime: '2026-03-30 09:16:52',
    ip: '105.66.12.99',
    location: 'Casablanca, MA',
    success: false,
    eventType: 'LOGIN_FAILURE',
    label: 'Connexion',
    detail: 'Mot de passe invalide',
  },
  {
    id: 'acc-1',
    user: 'jean.dupont@mykyntus.com',
    datetime: '2026-03-30 08:12:04',
    ip: '105.66.12.44',
    location: 'Casablanca, MA',
    success: true,
    eventType: 'LOGIN_SUCCESS',
    label: 'Connexion',
  },
  {
    id: 'acc-2',
    user: 'rh@mykyntus.com',
    datetime: '2026-03-30 08:45:22',
    ip: '192.168.1.10',
    location: 'Réseau interne',
    success: true,
    eventType: 'LOGIN_SUCCESS',
    label: 'Connexion',
  },
  {
    id: 'acc-3',
    user: 'unknown@evil.test',
    datetime: '2026-03-30 09:01:11',
    ip: '185.220.101.33',
    location: 'Frankfurt, DE',
    success: false,
    eventType: 'LOGIN_FAILURE',
    label: 'Connexion',
    detail: 'Mot de passe invalide',
  },
  {
    id: 'acc-4',
    user: 'admin@mykyntus.com',
    datetime: '2026-03-30 09:15:00',
    ip: '10.0.0.5',
    location: 'Réseau interne',
    success: true,
    eventType: 'LOGOUT',
    label: 'Déconnexion',
  },
  {
    id: 'acc-5',
    user: 'sophie.leroy@mykyntus.com',
    datetime: '2026-03-30 09:17:58',
    ip: '105.66.12.99',
    location: 'Casablanca, MA',
    success: false,
    eventType: 'SUSPICIOUS',
    label: 'Tentative',
    detail: '5 échecs en 2 min — brute force suspect',
    securityFlag: 'WARNING',
  },
];

export type AnomalyPriority = 'P1' | 'P2' | 'P3';

export interface AnomalyRow {
  id: string;
  title: string;
  description: string;
  priority: AnomalyPriority;
  detectedAt: string;
  category: string;
  /** Utilisateur ou libellé pour filtrer le journal */
  relatedUserLabel?: string;
  /** Termes pour recherche journal (ids, mots-clés) */
  searchHints?: string[];
  severityUi: 'CRITICAL' | 'WARNING';
}

export const ANOMALIES_DEMO: AnomalyRow[] = [
  {
    id: 'anom-1',
    title: 'Suppression massive',
    description: 'Bob Martin a supprimé 10 éléments en 2 min (seuil : 3).',
    priority: 'P1',
    detectedAt: '2026-03-30 07:55',
    category: 'Intégrité données',
    relatedUserLabel: 'Bob Martin',
    searchHints: ['Bob Martin', 'Suppression'],
    severityUi: 'CRITICAL',
  },
  {
    id: 'anom-2',
    title: 'Connexion inhabituelle',
    description: 'Connexion depuis un pays non habituel pour ce compte (DE alors que profil MA).',
    priority: 'P2',
    detectedAt: '2026-03-30 09:01',
    category: 'Accès',
    relatedUserLabel: 'unknown@evil.test',
    searchHints: ['Frankfurt', '185.220'],
    severityUi: 'CRITICAL',
  },
  {
    id: 'anom-3',
    title: 'Activité hors horaires',
    description: 'Volume anormal d’actions entre 02:00 et 04:00 sur le tenant parrainage.',
    priority: 'P2',
    detectedAt: '2026-03-29 03:12',
    category: 'Comportement',
    severityUi: 'WARNING',
  },
];

export interface ReportingKpis {
  actionsPerDay: number;
  criticalPercent: number;
  topUser: string;
  topUserActions: number;
  totalActions: number;
  activeUsers: number;
  anomaliesCount: number;
}

export const REPORTING_KPIS: ReportingKpis = {
  actionsPerDay: 142,
  criticalPercent: 4.2,
  topUser: 'RH Parrainage',
  topUserActions: 38,
  totalActions: 4280,
  activeUsers: 86,
  anomaliesCount: ANOMALIES_DEMO.length,
};

/** Top utilisateurs (reporting) */
export const TOP_ACTIVE_USERS = [
  { name: 'RH Parrainage', actions: 412 },
  { name: 'Admin Ops', actions: 305 },
  { name: 'Jean Dupont', actions: 198 },
  { name: 'Comptable', actions: 156 },
  { name: 'Sophie Leroy', actions: 121 },
] as const;

/** Répartition pour graphique (actions par type) */
export const ACTIONS_BY_TYPE = [
  { label: 'Création', value: 35, color: 'rgb(59, 130, 246)' },
  { label: 'Modification', value: 28, color: 'rgb(245, 158, 11)' },
  { label: 'Validation', value: 22, color: 'rgb(16, 185, 129)' },
  { label: 'Suppression', value: 10, color: 'rgb(244, 63, 94)' },
  { label: 'Config', value: 5, color: 'rgb(139, 92, 246)' },
];

/** Points pour courbe activité (7 derniers jours) */
export const ACTIVITY_BY_DAY = [
  { day: 'Lun', v: 40 },
  { day: 'Mar', v: 52 },
  { day: 'Mer', v: 48 },
  { day: 'Jeu', v: 61 },
  { day: 'Ven', v: 55 },
  { day: 'Sam', v: 22 },
  { day: 'Dim', v: 18 },
] as const;

/** Répartition par rôle (barres) */
export const ACTIONS_BY_ROLE = [
  { role: 'Pilote', pct: 32 },
  { role: 'Coach', pct: 18 },
  { role: 'Manager', pct: 14 },
  { role: 'RP', pct: 12 },
  { role: 'RH', pct: 16 },
  { role: 'Admin', pct: 8 },
];
