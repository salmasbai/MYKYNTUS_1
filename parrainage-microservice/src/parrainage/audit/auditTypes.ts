/** Types partagés — module Audit parrainage */

export type SeverityLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export type SortKey =
  | 'datetime'
  | 'employee'
  | 'action'
  | 'item'
  | 'status'
  | 'departement'
  | 'pole'
  | 'cellule'
  | 'roleMetier'
  | 'severity';

export interface JournalRow {
  id: string;
  datetime: string;
  employee: string;
  action: string;
  item: string;
  status: string;
  departement: string;
  pole: string;
  cellule: string;
  roleMetier: string;
  ip: string;
  device: string;
  severity: SeverityLevel;
  actionCode: string;
  /** État avant (audit technique) */
  beforeState: Record<string, unknown>;
  /** État après */
  afterState: Record<string, unknown>;
  /** Métadonnées brutes (traçabilité) */
  metadata: Record<string, unknown>;
}
