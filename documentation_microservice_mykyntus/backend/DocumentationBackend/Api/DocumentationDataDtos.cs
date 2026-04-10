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
    /// <summary>Identifiant du type document (null si demande « autre » / personnalisée).</summary>
    string? DocumentTypeId,
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
    string Source,
    bool IsActive,
    string? DocumentTypeId,
    string? DocumentTypeName,
    IReadOnlyList<string> VariableNames,
    string? CurrentVersionId,
    int? CurrentVersionNumber,
    string UpdatedAt);

public sealed record DocumentTemplateGenerateResponse(
    string GeneratedDocumentId,
    string FileName,
    string StorageUri,
    string Status);

public sealed record DocumentTemplateVersionResponse(
    string Id,
    int VersionNumber,
    string Status,
    string StructuredContent,
    string? OriginalAssetUri,
    string CreatedAt,
    string? PublishedAt,
    IReadOnlyList<DocumentTemplateVariableResponse> Variables);

public sealed record DocumentTemplateVariableResponse(
    string Id,
    string Name,
    string Type,
    bool IsRequired,
    string? DefaultValue,
    string? ValidationRule,
    int SortOrder);

public sealed record DocumentTemplateDetailResponse(
    string Id,
    string Code,
    string Name,
    string Source,
    bool IsActive,
    string? DocumentTypeId,
    string? DocumentTypeName,
    string UpdatedAt,
    DocumentTemplateVersionResponse? CurrentVersion);

public sealed class TemplateVariableInput
{
    public string Name { get; set; } = "";
    public string Type { get; set; } = "text";
    public bool IsRequired { get; set; } = true;
    public string? DefaultValue { get; set; }
    public string? ValidationRule { get; set; }
}

public sealed class CreateDocumentTemplateRequest
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Source { get; set; } = "UPLOAD";
    public Guid? DocumentTypeId { get; set; }
    public string StructuredContent { get; set; } = "";
    public string? OriginalAssetUri { get; set; }
    public IReadOnlyList<TemplateVariableInput> Variables { get; set; } = Array.Empty<TemplateVariableInput>();
}

public sealed class UpdateDocumentTemplateRequest
{
    public string Name { get; set; } = "";
    public Guid? DocumentTypeId { get; set; }
}

public sealed class UploadTemplateRequest
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public Guid? DocumentTypeId { get; set; }
    public string FileName { get; set; } = "";
    public string Content { get; set; } = "";
}

public sealed class RuleGenerateTemplateRequest
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public Guid? DocumentTypeId { get; set; }
    public string Description { get; set; } = "";
    public IReadOnlyList<string> SuggestedVariables { get; set; } = Array.Empty<string>();
}

public sealed class CreateTemplateVersionRequest
{
    public string StructuredContent { get; set; } = "";
    public string Status { get; set; } = "draft";
    public string? OriginalAssetUri { get; set; }
    public IReadOnlyList<TemplateVariableInput> Variables { get; set; } = Array.Empty<TemplateVariableInput>();
}

public sealed class UpdateTemplateStatusRequest
{
    public bool IsActive { get; set; }
}

public sealed class TemplateTestRunRequest
{
    public IReadOnlyDictionary<string, string> SampleData { get; set; } = new Dictionary<string, string>();
}

public sealed record TemplateTestRunResponse(
    string RenderedContent,
    IReadOnlyList<string> MissingVariables,
    string PreviewFileName);

public sealed class DocumentTemplateGenerateRequest
{
    public Guid? DocumentRequestId { get; set; }
    public Guid? DocumentTypeId { get; set; }
    public IReadOnlyDictionary<string, string> Variables { get; set; } = new Dictionary<string, string>();
}
