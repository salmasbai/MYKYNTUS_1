/** DTO alignés sur les réponses JSON du backend (camelCase). */

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface DocumentTypeDto {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  retentionDays: number;
  workflowId: string;
  mandatory: boolean;
}

export interface DocumentRequestDto {
  id: string;
  internalId: string;
  type: string;
  requestDate: string;
  status: string;
  employeeName: string;
  employeeId: string | null;
  reason: string | null;
  isCustomType: boolean;
  /** Actions autorisées pour l’acteur courant — fourni par le backend. */
  allowedActions: string[];
  rejectionReason: string | null;
  decidedAt: string | null;
}

export interface AuditLogDto {
  id: string;
  occurredAt: string;
  actorName: string | null;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  success: boolean | null;
  errorMessage: string | null;
  correlationId?: string | null;
}

/** Annuaire — table documentation.directory_users (API réelle). */
export interface DirectoryUserDto {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  /** Valeur API : pilote, coach, manager, rp, rh, admin, audit */
  role: string;
}

export interface DbStatusDto {
  connected: boolean;
  schema?: string;
  documentTypeCount?: number;
  message?: string;
  errorMessage?: string;
}

/** Le demandeur est celui du contexte en-têtes ; ne pas envoyer requesterUserId sauf aligné avec la gateway. */
export interface CreateDocumentRequestPayload {
  beneficiaryUserId?: string | null;
  documentTypeId?: string | null;
  isCustomType: boolean;
  customTypeDescription?: string | null;
  reason?: string | null;
  complementaryComments?: string | null;
}
