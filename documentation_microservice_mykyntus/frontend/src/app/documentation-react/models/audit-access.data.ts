export interface AuditAccessRow {

  id: string;

  user: string;

  datetime: string;

  ip: string;

  location: string;

  success: boolean;

  /** Libellé technique issu du journal d’audit (API). */

  type: string;

  role: string;

  departement: string;

}

