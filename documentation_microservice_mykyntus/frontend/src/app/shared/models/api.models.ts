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
  requesterUserId: string | null;
  beneficiaryUserId: string | null;
  organizationalUnitId: string | null;
  /** Aligné backend : absent si ancienne réponse ou demande sans type catalogue. */
  documentTypeId?: string | null;
  reason: string | null;
  isCustomType: boolean;
  /** Actions autorisées pour l’acteur courant — fourni par le backend. */
  allowedActions: string[];
  rejectionReason: string | null;
  decidedAt: string | null;
}

export interface DocumentTemplateListItemDto {
  id: string;
  code: string;
  name: string;
  source: string;
  isActive: boolean;
  documentTypeId: string | null;
  documentTypeName: string | null;
  variableNames: string[];
  currentVersionId: string | null;
  currentVersionNumber: number | null;
  updatedAt: string;
}

export interface TemplateVariableDto {
  id: string;
  name: string;
  type: 'text' | 'date' | 'number' | string;
  isRequired: boolean;
  defaultValue: string | null;
  validationRule: string | null;
  sortOrder: number;
}

export interface TemplateVersionDto {
  id: string;
  versionNumber: number;
  status: 'draft' | 'published' | 'archived' | string;
  structuredContent: string;
  originalAssetUri: string | null;
  createdAt: string;
  publishedAt: string | null;
  variables: TemplateVariableDto[];
}

export interface DocumentTemplateDetailDto {
  id: string;
  code: string;
  name: string;
  source: string;
  isActive: boolean;
  documentTypeId: string | null;
  documentTypeName: string | null;
  updatedAt: string;
  currentVersion: TemplateVersionDto | null;
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

/** Unité organisationnelle (pôle / cellule / département). */
export interface OrganizationalUnitSummaryDto {
  id: string;
  code: string;
  name: string;
  /** pole | cellule | departement */
  unitType: string;
}

/** Annuaire — table documentation.directory_users (API réelle). */
export interface DirectoryUserDto {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  /** Valeur API : pilote, coach, manager, rp, rh, admin, audit */
  role: string;
  /** Hiérarchie métier : coach → manager d’agence. */
  managerId?: string | null;
  /** Hiérarchie métier : pilote → coach référent. */
  coachId?: string | null;
  /** Hiérarchie métier : manager → RP de tutelle. */
  rpId?: string | null;
  /** Rattachement organisationnel explicite (obligatoire en base). */
  poleId: string;
  celluleId: string;
  departementId: string;
  pole?: OrganizationalUnitSummaryDto | null;
  cellule?: OrganizationalUnitSummaryDto | null;
  departement?: OrganizationalUnitSummaryDto | null;
}

export interface DbStatusDto {
  connected: boolean;
  schema?: string;
  serverDatabase?: string;
  configuredHost?: string;
  configuredPort?: number;
  configuredDatabase?: string;
  documentTypeCount?: number;
  documentRequestCount?: number;
  documentRequestTotalAllTenants?: number;
  hint?: string;
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
