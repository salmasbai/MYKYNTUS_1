import type { AuditLogDto, DocumentRequestDto, DocumentTypeDto } from '../../shared/models/api.models';
import type { DocumentationDocument, DocumentationRequest, DocumentationTemplate } from '../interfaces/documentation-entities';

export function mapDocumentRequestDto(d: DocumentRequestDto): DocumentationRequest {
  return {
    id: d.id,
    type: d.type,
    requestDate: d.requestDate,
    status: d.status as DocumentationRequest['status'],
    employeeName: d.employeeName,
    employeeId: d.employeeId ?? undefined,
    reason: d.reason ?? undefined,
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
