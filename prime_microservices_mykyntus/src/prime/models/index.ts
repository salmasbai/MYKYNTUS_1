export type Role = 'Admin' | 'RH' | 'RP' | 'Manager' | 'Coach' | 'Pilote' | 'Audit';

// Rôles autorisés à accéder au module PRIME
export const PRIME_AUTHORIZED_ROLES: Role[] = ['Admin', 'RH', 'RP', 'Manager', 'Coach', 'Pilote', 'Audit'];

export interface Department {
  id: string;
  name: string;
  poles: Pole[];
}

export interface Pole {
  id: string;
  name: string;
  departmentId: string;
  cells: Cellule[];
}

export interface Cellule {
  id: string;
  name: string;
  poleId: string;
  teams: Team[];
}

export interface Team {
  id: string;
  name: string;
  celluleId: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  /** Supérieur hiérarchique (Pilote→Coach→Manager→RP). RP sans parent. */
  parentId?: string;
  /** Équipe (niveau le plus fin de la hiérarchie organisationnelle). */
  teamId: string;
  /** Périmètre organisationnel (aligné sur teamId / structure Département → Pôle → Cellule). */
  departementId: string;
  poleId: string;
  celluleId: string;
  email: string;
  avatar?: string;
}

export type PrimeStatus = 'Active' | 'Inactive';

export interface PrimeType {
  id: string;
  name: string;
  type: string;
  departmentId: string;
  status: PrimeStatus;
  description?: string;
}

export type ConditionType = '>' | '<' | '>=' | '<=' | '==' | '!=';
export type CalculationMethod = 'Fixed' | 'Percentage' | 'Tiered';

export interface PrimeRule {
  id: string;
  primeTypeId: string;
  departmentId?: string;
  poleId?: string;
  celluleId?: string;
  teamId?: string;
  roleId?: Role;
  conditionField: string;
  conditionType: ConditionType;
  targetValue: number;
  calculationMethod: CalculationMethod;
  amount: number;
  period: 'Monthly' | 'Quarterly' | 'Yearly';
}

export type PrimeResultStatus =
  | 'Pending'
  | 'Coach Approved'
  | 'Manager Approved'
  | 'RP Approved'
  | 'RH Approved'
  | 'Rejected';

export interface PrimeResult {
  id: string;
  employeeId: string;
  primeTypeId: string;
  score: number;
  amount: number;
  status: PrimeResultStatus;
  period: string; // e.g., '2026-03'
  approvedBy?: string;
  date: string;
}
