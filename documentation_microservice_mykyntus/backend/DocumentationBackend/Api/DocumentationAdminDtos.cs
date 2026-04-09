namespace DocumentationBackend.Api;

public sealed class AdminGeneralConfigDto
{
    public string SystemName { get; set; } = "";
    public string DefaultLanguage { get; set; } = "";
    public string DefaultTimezone { get; set; } = "";
    public int MaxFileSizeMB { get; set; }
    public List<string> AllowedFileTypes { get; set; } = [];
    public bool VersioningEnabled { get; set; }
    public int RetentionDays { get; set; }
    public bool DocumentsMandatoryByType { get; set; }
    public bool AutoNumberingEnabled { get; set; }
    public string NumberingPattern { get; set; } = "";
    public AdminSecurityDto Security { get; set; } = new();
    public AdminNotificationsDto Notifications { get; set; } = new();
}

public sealed class AdminSecurityDto
{
    public bool EncryptionEnabled { get; set; }
    public bool ExternalSharingEnabled { get; set; }
    public bool ElectronicSignatureEnabled { get; set; }
}

public sealed class AdminNotificationsDto
{
    public bool EmailOnUpload { get; set; }
    public bool EmailOnValidation { get; set; }
    public bool EmailOnRejection { get; set; }
    public bool ReminderExpiredEnabled { get; set; }
}

public sealed class AdminDocTypeDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public string Department { get; set; } = "";
    public int RetentionDays { get; set; }
    public string WorkflowId { get; set; } = "";
    public bool Mandatory { get; set; }
}

public sealed class CreateDocTypeRequestDto
{
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public string Department { get; set; } = "";
    public int RetentionDays { get; set; }
    public string WorkflowId { get; set; } = "";
    public bool Mandatory { get; set; }
}

public sealed class AdminWorkflowDefinitionDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public List<AdminWorkflowStepDto> Steps { get; set; } = [];
    public AdminWorkflowAuditDto AuditAccess { get; set; } = new();
}

public sealed class AdminWorkflowStepDto
{
    public string Id { get; set; } = "";
    public string Key { get; set; } = "";
    public string Name { get; set; } = "";
    public string AssignedRole { get; set; } = "";
    public List<string> Actions { get; set; } = [];
    public int SlaHours { get; set; }
    public string NotificationKey { get; set; } = "email";
}

public sealed class AdminWorkflowAuditDto
{
    public bool Enabled { get; set; }
    public bool ReadOnly { get; set; }
    public bool Logs { get; set; }
    public bool History { get; set; }
    public bool Export { get; set; }
}

public sealed class AdminPermissionPolicyDto
{
    public string Id { get; set; } = "";
    public string Role { get; set; } = "";
    public string? DocTypeId { get; set; }
    public string? Department { get; set; }
    public AdminPermissionSetDto Permissions { get; set; } = new();
}

public sealed class AdminPermissionSetDto
{
    public bool Read { get; set; }
    public bool Create { get; set; }
    public bool Update { get; set; }
    public bool Delete { get; set; }
    public bool Validate { get; set; }
}

public sealed class AdminStorageConfigDto
{
    public string StorageType { get; set; } = "Cloud";
    public string ApiUrl { get; set; } = "";
    public string BucketName { get; set; } = "";
    public string Region { get; set; } = "";
    public string AccessKey { get; set; } = "";
    public bool BackupEnabled { get; set; }
    public bool CompressionEnabled { get; set; }
}
