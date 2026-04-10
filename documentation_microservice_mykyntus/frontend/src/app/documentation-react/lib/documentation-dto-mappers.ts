import type { AuditLogDto, DocumentRequestDto, DocumentTypeDto } from '../../shared/models/api.models';
import type { DocumentationDocument, DocumentationRequest, DocumentationTemplate } from '../interfaces/documentation-entities';

function normalizeRequestStatus(raw: string): DocumentationRequest['status'] {
  const key = raw.trim().toLowerCase();
  const map: Record<string, DocumentationRequest['status']> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    generated: 'Generated',
    cancelled: 'Cancelled',
  };
  return map[key] ?? (raw as DocumentationRequest['status']);
}

export function mapDocumentRequestDto(d: DocumentRequestDto): DocumentationRequest {
  return {
    id: d.id,
    internalId: d.internalId,
    type: d.type,
    requestDate: d.requestDate,
    status: normalizeRequestStatus(d.status),
    employeeName: d.employeeName,
    employeeId: d.employeeId ?? undefined,
    reason: d.reason ?? undefined,
    allowedActions: d.allowedActions ?? [],
  };
}

export function mapRequestToGeneratedDocument(r: DocumentationRequest): DocumentationDocument | null {
  if (r.status !== 'Generated') return null;
  return {
    id: r.id,
    name: `${r.type} (${r.id})`,
    type: r.type,
    dateCreated: r.requestDate,
    status: 'Generated',
    employeeName: r.employeeName,
    employeeId: r.employeeId,
  };
}

export function mapDocumentTypeDtoToTemplate(t: DocumentTypeDto): DocumentationTemplate {
  return {
    id: t.id,
    name: t.name,
    lastModified: '',
    variables: [],
  };
}
