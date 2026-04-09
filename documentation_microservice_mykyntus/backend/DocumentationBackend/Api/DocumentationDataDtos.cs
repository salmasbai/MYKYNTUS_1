namespace DocumentationBackend.Api;

public sealed record PagedResponse<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

public sealed record DocumentTypeResponse(
    string Id,
    string Name,
    string Code,
    string Description,
    string Department,
    int RetentionDays,
    string WorkflowId,
    bool Mandatory);

public sealed record DocumentRequestResponse(
    string Id,
    string InternalId,
    string Type,
    string RequestDate,
    string Status,
    string EmployeeName,
    string? EmployeeId,
    string? RequesterUserId,
    string? BeneficiaryUserId,
    string? OrganizationalUnitId,
    string? Reason,
    bool IsCustomType,
    IReadOnlyList<string> AllowedActions,
    string? RejectionReason,
    string? DecidedAt);

public sealed record AuditLogResponse(
    string Id,
    string OccurredAt,
    string? ActorName,
    string? ActorUserId,
    string Action,
    string EntityType,
    string? EntityId,
    bool? Success,
    string? ErrorMessage,
    string? CorrelationId);

/// <summary>Résumé unité organisationnelle (pôle / cellule / département).</summary>
public sealed record OrganizationalUnitSummary(string Id, string Code, string Name, string UnitType);

/// <summary>Profil annuaire (schéma documentation.directory_users).</summary>
public sealed record DirectoryUserResponse(
    string Id,
    string Prenom,
    string Nom,
    string Email,
    string Role,
    string? ManagerId,
    string? CoachId,
    string? RpId,
    string PoleId,
    string CelluleId,
    string DepartementId,
    OrganizationalUnitSummary? Pole,
    OrganizationalUnitSummary? Cellule,
    OrganizationalUnitSummary? Departement);

public sealed record DocumentTemplateListItemResponse(
    string Id,
    string Code,
    string Name,
    string? DocumentTypeId,
    string? DocumentTypeName,
    IReadOnlyList<string> VariableNames,
    string UpdatedAt);

public sealed record DocumentTemplateGenerateResponse(
    string GeneratedDocumentId,
    string FileName,
    string StorageUri,
    string Status);

public sealed class DocumentTemplateGenerateRequest
{
    public Guid? DocumentRequestId { get; set; }
    public Guid? DocumentTypeId { get; set; }
}
