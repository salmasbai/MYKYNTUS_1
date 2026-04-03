using DocumentationBackend.Data;

namespace DocumentationBackend.Data.Entities;

public class Workflow
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public bool IsDefault { get; set; }
    public bool AuditEnabled { get; set; }
    public bool AuditReadOnly { get; set; }
    public bool AuditLogs { get; set; }
    public bool AuditHistory { get; set; }
    public bool AuditExport { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<DocumentType> DocumentTypes { get; set; } = new List<DocumentType>();
    public ICollection<WorkflowStep> Steps { get; set; } = new List<WorkflowStep>();
}

public class DocumentType
{
    public Guid Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string? DepartmentCode { get; set; }
    public int RetentionDays { get; set; }
    public Guid? WorkflowId { get; set; }
    public bool IsMandatory { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Workflow? Workflow { get; set; }
    public ICollection<DocumentRequest> DocumentRequests { get; set; } = new List<DocumentRequest>();
    public ICollection<GeneratedDocument> GeneratedDocuments { get; set; } = new List<GeneratedDocument>();
    public ICollection<PermissionPolicy> PermissionPolicies { get; set; } = new List<PermissionPolicy>();
}

public class WorkflowStep
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public int StepOrder { get; set; }
    public string StepKey { get; set; } = "";
    public string Name { get; set; } = "";
    public AppRole AssignedRole { get; set; }
    public int SlaHours { get; set; }
    public WorkflowNotificationKey NotificationKey { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Workflow Workflow { get; set; } = null!;
    public ICollection<WorkflowStepAction> Actions { get; set; } = new List<WorkflowStepAction>();
}

public class WorkflowStepAction
{
    public Guid WorkflowStepId { get; set; }
    public WorkflowActionKey Action { get; set; }

    public WorkflowStep Step { get; set; } = null!;
}

public class DocumentRequest
{
    public Guid Id { get; set; }
    public string? RequestNumber { get; set; }
    public Guid RequesterUserId { get; set; }
    public Guid? BeneficiaryUserId { get; set; }
    public Guid? DocumentTypeId { get; set; }
    public bool IsCustomType { get; set; }
    public string? CustomTypeDescription { get; set; }
    public string? Reason { get; set; }
    public string? ComplementaryComments { get; set; }
    public DocumentRequestStatus Status { get; set; }
    public Guid? DecidedByUserId { get; set; }
    public DateTimeOffset? DecidedAt { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public DocumentType? DocumentType { get; set; }
    public ICollection<GeneratedDocument> GeneratedDocuments { get; set; } = new List<GeneratedDocument>();
}

public class GeneratedDocument
{
    public Guid Id { get; set; }
    public Guid? DocumentRequestId { get; set; }
    public Guid OwnerUserId { get; set; }
    public Guid? DocumentTypeId { get; set; }
    public string FileName { get; set; } = "";
    public string StorageUri { get; set; } = "";
    public string? MimeType { get; set; }
    public long? FileSizeBytes { get; set; }
    public GeneratedDocumentStatus Status { get; set; }
    public int VersionNumber { get; set; }
    public string? ChecksumSha256 { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public DocumentRequest? DocumentRequest { get; set; }
    public DocumentType? DocumentType { get; set; }
}

public class DocumentTemplate
{
    public Guid Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<DocumentTemplateVariable> Variables { get; set; } = new List<DocumentTemplateVariable>();
}

public class DocumentTemplateVariable
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public string VariableName { get; set; } = "";
    public int SortOrder { get; set; }

    public DocumentTemplate Template { get; set; } = null!;
}

public class PermissionPolicy
{
    public Guid Id { get; set; }
    public AppRole Role { get; set; }
    public Guid? DocumentTypeId { get; set; }
    public string? DepartmentCode { get; set; }
    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
    public bool CanValidate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public DocumentType? DocumentType { get; set; }
}

public class DmsGeneralConfiguration
{
    public Guid Id { get; set; }
    public string SystemName { get; set; } = "";
    public string DefaultLanguage { get; set; } = "";
    public string DefaultTimezone { get; set; } = "";
    public int MaxFileSizeMB { get; set; }
    public string AllowedFileTypes { get; set; } = "";
    public bool VersioningEnabled { get; set; }
    public int RetentionDaysDefault { get; set; }
    public bool DocumentsMandatoryByType { get; set; }
    public bool AutoNumberingEnabled { get; set; }
    public string NumberingPattern { get; set; } = "";
    public bool EncryptionEnabled { get; set; }
    public bool ExternalSharingEnabled { get; set; }
    public bool ElectronicSignatureEnabled { get; set; }
    public bool EmailOnUpload { get; set; }
    public bool EmailOnValidation { get; set; }
    public bool EmailOnRejection { get; set; }
    public bool ReminderExpiredEnabled { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class DmsStorageConfiguration
{
    public Guid Id { get; set; }
    public StorageType StorageType { get; set; }
    public string? ApiUrl { get; set; }
    public string? BucketName { get; set; }
    public string? Region { get; set; }
    public string? AccessKeyReference { get; set; }
    public bool BackupEnabled { get; set; }
    public bool CompressionEnabled { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class AuditLog
{
    public Guid Id { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = "";
    public string EntityType { get; set; } = "";
    public Guid? EntityId { get; set; }
    public Guid? CorrelationId { get; set; }
    public System.Net.IPAddress? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Details { get; set; }
    public bool? Success { get; set; }
    public string? ErrorMessage { get; set; }
}

/// <summary>Annuaire utilisateurs (données réelles — table <c>directory_users</c>).</summary>
public class DirectoryUser
{
    public Guid Id { get; set; }
    public string TenantId { get; set; } = "";
    public string Prenom { get; set; } = "";
    public string Nom { get; set; } = "";
    public string Email { get; set; } = "";
    public AppRole Role { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class DocumentRequestSequence
{
    public int Year { get; set; }
    public int LastValue { get; set; }
}
