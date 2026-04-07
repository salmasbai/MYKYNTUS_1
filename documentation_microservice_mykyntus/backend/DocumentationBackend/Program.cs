using System.Data;
using System.Text.Json.Serialization;
using DocumentationBackend.Context;
using DocumentationBackend.Data;
using DocumentationBackend.Middleware;
using DocumentationBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("devCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://localhost:4202")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSingleton<DocumentationInMemoryStore>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<DocumentationCorrelationContext>();
builder.Services.AddScoped<DocumentationUserContext>();
builder.Services.AddScoped<IDocumentationTenantAccessor, DocumentationTenantAccessor>();
builder.Services.AddScoped<DocumentationWorkflowService>();

var documentationCs = builder.Configuration.GetConnectionString("Documentation")
    ?? throw new InvalidOperationException("ConnectionStrings:Documentation manquante (voir appsettings).");

// Mot de passe hors chaîne ADO : évite les ambiguïtés avec caractères spéciaux (ex. !) et priorise DocumentationDb:Password.
var csb = new NpgsqlConnectionStringBuilder(documentationCs);
var documentationPassword = builder.Configuration["DocumentationDb:Password"];
if (!string.IsNullOrEmpty(documentationPassword))
    csb.Password = documentationPassword;

// Enregistrement des enums PostgreSQL (types créés dans le schéma « documentation »).
// Noms qualifiés obligatoires : sans « documentation. », Npgsql peut ne pas résoudre le type OID et lever une erreur à la lecture (500).
if (string.IsNullOrWhiteSpace(csb.SearchPath))
    csb.SearchPath = "documentation, public";

const string DocEnum = "documentation";
// Enums PostgreSQL : MapEnum sur NpgsqlDataSource (recommandé). Ne pas ajouter NpgsqlConnection.GlobalTypeMapper :
// obsolète, et en conflit avec cette source dédiée + EF HasPostgresEnum / HasColumnType.
var documentationDataSourceBuilder = new NpgsqlDataSourceBuilder(csb.ConnectionString);
documentationDataSourceBuilder.MapEnum<DocumentRequestStatus>($"{DocEnum}.document_request_status");
documentationDataSourceBuilder.MapEnum<GeneratedDocumentStatus>($"{DocEnum}.generated_document_status");
documentationDataSourceBuilder.MapEnum<WorkflowNotificationKey>($"{DocEnum}.workflow_notification_key");
documentationDataSourceBuilder.MapEnum<WorkflowActionKey>($"{DocEnum}.workflow_action_key");
documentationDataSourceBuilder.MapEnum<AppRole>($"{DocEnum}.app_role");
documentationDataSourceBuilder.MapEnum<StorageType>($"{DocEnum}.storage_type");
var documentationDataSource = documentationDataSourceBuilder.Build();
builder.Services.AddSingleton(documentationDataSource);

builder.Services.AddDbContext<DocumentationDbContext>((sp, options) =>
{
    options.UseNpgsql(sp.GetRequiredService<NpgsqlDataSource>(), npgsql =>
    {
        npgsql.MigrationsHistoryTable("__ef_migrations_history", "documentation");
        // EF Core 9+ : MapEnum sur le builder EF (en plus de NpgsqlDataSourceBuilder.MapEnum).
        // Sans cela, EF peut encore matérialiser les colonnes enum PostgreSQL comme Int32 → InvalidCastException.
        const string docSchema = "documentation";
        npgsql.MapEnum<AppRole>("app_role", docSchema);
        npgsql.MapEnum<DocumentRequestStatus>("document_request_status", docSchema);
        npgsql.MapEnum<GeneratedDocumentStatus>("generated_document_status", docSchema);
        npgsql.MapEnum<WorkflowNotificationKey>("workflow_notification_key", docSchema);
        npgsql.MapEnum<WorkflowActionKey>("workflow_action_key", docSchema);
        npgsql.MapEnum<StorageType>("storage_type", docSchema);
    });
    options.UseSnakeCaseNamingConvention();
});

var app = builder.Build();

app.UseMiddleware<UnhandledExceptionMiddleware>();
app.UseCors("devCors");
app.UseMiddleware<DocumentationCorrelationMiddleware>();
// Identité par en-têtes (X-User-Id, X-User-Role, X-Tenant-Id) → DocumentationUserContext (scoped), sans JWT dans ce service.
app.UseMiddleware<DocumentationUserContextMiddleware>();

app.MapGet("/health", () => Results.Json(new { status = "Healthy", service = "documentation" }));
app.MapGet("/healthz", () => Results.Json(new { status = "Healthy", service = "documentation" }));
app.MapGet("/ready", () => Results.Json(new { status = "Ready", service = "documentation" }));
app.MapGet("/api/documentation/health", () => Results.Json(new { status = "Healthy", service = "documentation" }));

// GET / n’avait aucune route → 404 dans les logs quand on ouvre http://localhost:5002/ dans le navigateur.
app.MapGet("/", () => Results.Json(new
{
    service = "DocumentationBackend",
    message = "API opérationnelle. Il n’y a pas de page HTML ici.",
    tryThese = new[] { "/health", "/api/documentation/db/status", "/api/documentation/health" },
}));

app.MapControllers();

app.MapGet("/api/documentation/db/status", async (
    DocumentationDbContext db,
    IConfiguration configuration,
    IHostEnvironment hostEnvironment,
    CancellationToken ct) =>
{
    var cs = configuration.GetConnectionString("Documentation") ?? "";
    var csb = new NpgsqlConnectionStringBuilder(cs);
    var statusPwd = configuration["DocumentationDb:Password"];
    if (!string.IsNullOrEmpty(statusPwd))
        csb.Password = statusPwd;

    try
    {
        var connection = db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(ct);
        try
        {
            var documentTypeCount = await db.DocumentTypes.CountAsync(ct);
            return Results.Ok(new
            {
                connected = true,
                schema = "documentation",
                documentTypeCount,
            });
        }
        finally
        {
            if (connection.State == ConnectionState.Open)
                await connection.CloseAsync();
        }
    }
    catch (Exception ex)
    {
        if (!hostEnvironment.IsDevelopment())
        {
            return Results.Ok(new
            {
                connected = false,
                schema = "documentation",
                message = "Impossible de joindre PostgreSQL.",
            });
        }

        return Results.Ok(new
        {
            connected = false,
            schema = "documentation",
            message = "Impossible de joindre PostgreSQL.",
            errorType = ex.GetType().Name,
            errorMessage = ex.Message,
            host = csb.Host,
            port = csb.Port,
            database = csb.Database,
            username = csb.Username,
            passwordConfigured = !string.IsNullOrEmpty(csb.Password),
            passwordFromDocumentationDbKey = !string.IsNullOrEmpty(configuration["DocumentationDb:Password"]),
            hint = "28P01 = mot de passe refusé par PostgreSQL. Si le mot de passe contient des caractères spéciaux, placez-le dans DocumentationDb:Password (JSON). Sinon alignez le mot de passe : ALTER USER postgres WITH PASSWORD 'votre_mot_de_passe'; (en superutilisateur).",
        });
    }
});

app.Run();

// -----------------------------
// Models
// -----------------------------

public class AdminGeneralConfig
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

    public SecurityConfig Security { get; set; } = new();
    public NotificationsConfig Notifications { get; set; } = new();
}

public class SecurityConfig
{
    public bool EncryptionEnabled { get; set; }
    public bool ExternalSharingEnabled { get; set; }
    public bool ElectronicSignatureEnabled { get; set; }
}

public class NotificationsConfig
{
    public bool EmailOnUpload { get; set; }
    public bool EmailOnValidation { get; set; }
    public bool EmailOnRejection { get; set; }
    public bool ReminderExpiredEnabled { get; set; }
}

public class AdminDocType
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

public class AdminPermissionSet
{
    public bool Read { get; set; }
    public bool Create { get; set; }
    public bool Update { get; set; }
    public bool Delete { get; set; }
    public bool Validate { get; set; }
}

public class AdminPermissionPolicy
{
    public string Id { get; set; } = "";
    public string Role { get; set; } = "";
    public string? DocTypeId { get; set; }
    public string? Department { get; set; }
    public AdminPermissionSet Permissions { get; set; } = new();
}

public class AdminWorkflowStep
{
    public string Id { get; set; } = "";
    public string Key { get; set; } = "";
    public string Name { get; set; } = "";
    public string AssignedRole { get; set; } = "";
    public List<string> Actions { get; set; } = [];
    public int SlaHours { get; set; }
    public string NotificationKey { get; set; } = "";
}

public class AdminWorkflowDefinition
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public List<AdminWorkflowStep> Steps { get; set; } = [];
}

public class AdminStorageConfig
{
    public string StorageType { get; set; } = "Cloud";
    public string ApiUrl { get; set; } = "";
    public string BucketName { get; set; } = "";
    public string Region { get; set; } = "";
    public string AccessKey { get; set; } = "";
    public bool BackupEnabled { get; set; }
    public bool CompressionEnabled { get; set; }
}

// Update/create request DTOs
public class CreateDocTypeRequest
{
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public string Department { get; set; } = "";
    public int RetentionDays { get; set; }
    public string WorkflowId { get; set; } = "";
    public bool Mandatory { get; set; }
}

public class UpdateDocTypeRequest : CreateDocTypeRequest { }

public class AdminWorkflowDefinitionUpdateRequest
{
    public string Name { get; set; } = "";
    public List<AdminWorkflowStep> Steps { get; set; } = [];
}

// -----------------------------
// In-memory store
// -----------------------------

public class DocumentationInMemoryStore
{
    private AdminGeneralConfig _generalConfig;
    private List<AdminDocType> _docTypes;
    private List<AdminWorkflowDefinition> _workflowDefinitions;
    private List<AdminPermissionPolicy> _permissionPolicies;
    private AdminStorageConfig _storageConfig;

    public DocumentationInMemoryStore()
    {
        // initialAdminGeneralConfig
        _generalConfig = new AdminGeneralConfig
        {
            SystemName = "MyKyntus DMS",
            DefaultLanguage = "fr",
            DefaultTimezone = "Europe/Paris",
            MaxFileSizeMB = 25,
            AllowedFileTypes = ["pdf", "doc", "docx", "png", "jpg"],

            VersioningEnabled = true,
            RetentionDays = 365,
            DocumentsMandatoryByType = true,
            AutoNumberingEnabled = true,
            NumberingPattern = "DOC-{YEAR}-{SEQ}",

            Security = new SecurityConfig
            {
                EncryptionEnabled = true,
                ExternalSharingEnabled = false,
                ElectronicSignatureEnabled = true
            },
            Notifications = new NotificationsConfig
            {
                EmailOnUpload = true,
                EmailOnValidation = true,
                EmailOnRejection = true,
                ReminderExpiredEnabled = true
            }
        };

        // initialAdminDocTypes
        _docTypes = new List<AdminDocType>
        {
            new AdminDocType
            {
                Id = "dt-work-cert",
                Name = "Work Certificate",
                Code = "WORK_CERT",
                Description = "Attestation de travail standard.",
                Department = "Engineering",
                RetentionDays = 730,
                WorkflowId = "wf-default",
                Mandatory = true
            },
            new AdminDocType
            {
                Id = "dt-salary-cert",
                Name = "Salary Certificate",
                Code = "SALARY_CERT",
                Description = "Attestation de salaire.",
                Department = "HR",
                RetentionDays = 1825,
                WorkflowId = "wf-default",
                Mandatory = true
            },
            new AdminDocType
            {
                Id = "dt-training-cert",
                Name = "Training Certificate",
                Code = "TRAINING_CERT",
                Description = "Certificat de formation.",
                Department = "Sales",
                RetentionDays = 365,
                WorkflowId = "wf-default",
                Mandatory = false
            }
        };

        // initialAdminWorkflowDefinitions
        _workflowDefinitions = new List<AdminWorkflowDefinition>
        {
            new AdminWorkflowDefinition
            {
                Id = "wf-default",
                Name = "Workflow documentaire par défaut",
                Steps = new List<AdminWorkflowStep>
                {
                    new AdminWorkflowStep
                    {
                        Id = "wf-step-draft",
                        Key = "Brouillon",
                        Name = "Brouillon",
                        AssignedRole = "Manager",
                        Actions = ["Validate"],
                        SlaHours = 24,
                        NotificationKey = "email"
                    },
                    new AdminWorkflowStep
                    {
                        Id = "wf-step-rh",
                        Key = "ValidationRH",
                        Name = "Validation RH",
                        AssignedRole = "RH",
                        Actions = ["Validate", "Reject"],
                        SlaHours = 48,
                        NotificationKey = "email"
                    },
                    new AdminWorkflowStep
                    {
                        Id = "wf-step-manager",
                        Key = "ValidationManager",
                        Name = "Validation Manager",
                        AssignedRole = "Manager",
                        Actions = ["Approve", "Reject"],
                        SlaHours = 24,
                        NotificationKey = "email"
                    },
                    new AdminWorkflowStep
                    {
                        Id = "wf-step-terminal",
                        Key = "Terminal",
                        Name = "Approuvé / Rejeté / Archivé",
                        AssignedRole = "Manager",
                        Actions = ["Approve", "Reject", "Archive"],
                        SlaHours = 12,
                        NotificationKey = "email"
                    }
                }
            }
        };

        // initialAdminPermissions
        _permissionPolicies = new List<AdminPermissionPolicy>
        {
            new AdminPermissionPolicy
            {
                Id = "p-admin-all",
                Role = "Admin",
                Permissions = new AdminPermissionSet { Read = true, Create = true, Update = true, Delete = true, Validate = true }
            },
            new AdminPermissionPolicy
            {
                Id = "p-rh-all",
                Role = "RH",
                Permissions = new AdminPermissionSet { Read = true, Create = true, Update = true, Delete = false, Validate = true }
            },
            new AdminPermissionPolicy
            {
                Id = "p-manager-all",
                Role = "Manager",
                Permissions = new AdminPermissionSet { Read = true, Create = true, Update = true, Delete = false, Validate = true }
            },
            new AdminPermissionPolicy
            {
                Id = "p-audit-all",
                Role = "Audit",
                Permissions = new AdminPermissionSet { Read = true, Create = false, Update = false, Delete = false, Validate = false }
            },
            new AdminPermissionPolicy
            {
                Id = "p-rh-salary-hr",
                Role = "RH",
                DocTypeId = "dt-salary-cert",
                Department = "HR",
                Permissions = new AdminPermissionSet { Read = true, Create = true, Update = true, Delete = false, Validate = true }
            },
            new AdminPermissionPolicy
            {
                Id = "p-manager-work-eng",
                Role = "Manager",
                DocTypeId = "dt-work-cert",
                Department = "Engineering",
                Permissions = new AdminPermissionSet { Read = true, Create = true, Update = false, Delete = false, Validate = true }
            }
        };

        // initialAdminStorageConfig
        _storageConfig = new AdminStorageConfig
        {
            StorageType = "Cloud",
            ApiUrl = "https://api.kyntus.local/documents",
            BucketName = "mykyntus-dms-prod",
            Region = "eu-west-1",
            AccessKey = "AKIA****REDACTED",
            BackupEnabled = true,
            CompressionEnabled = true
        };
    }

    private static T DeepClone<T>(T value) =>
        System.Text.Json.JsonSerializer.Deserialize<T>(System.Text.Json.JsonSerializer.Serialize(value))!;

    private static string RandomId(string prefix) =>
        $"{prefix}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Random.Shared.Next(0, 1_000_000)}";

    public AdminGeneralConfig GetGeneralConfig() => DeepClone(_generalConfig);
    public AdminGeneralConfig SaveGeneralConfig(AdminGeneralConfig next) { _generalConfig = DeepClone(next); return DeepClone(_generalConfig); }
    public AdminGeneralConfig ResetGeneralConfig() { /* re-seed by rebuilding */ var seed = new DocumentationInMemoryStore(); _generalConfig = seed.GetGeneralConfig(); return DeepClone(_generalConfig); }

    public List<AdminDocType> GetDocTypes() => DeepClone(_docTypes);
    public AdminDocType CreateDocType(CreateDocTypeRequest payload)
    {
        var created = new AdminDocType
        {
            Id = RandomId("dt"),
            Name = payload.Name,
            Code = payload.Code,
            Description = payload.Description,
            Department = payload.Department,
            RetentionDays = payload.RetentionDays,
            WorkflowId = payload.WorkflowId,
            Mandatory = payload.Mandatory
        };
        _docTypes = [created, .. _docTypes];
        return DeepClone(created);
    }

    public AdminDocType? UpdateDocType(string id, UpdateDocTypeRequest payload)
    {
        var idx = _docTypes.FindIndex(d => d.Id == id);
        if (idx == -1) return null;

        _docTypes = _docTypes.Select(d => d.Id == id
            ? new AdminDocType
            {
                Id = id,
                Name = payload.Name,
                Code = payload.Code,
                Description = payload.Description,
                Department = payload.Department,
                RetentionDays = payload.RetentionDays,
                WorkflowId = payload.WorkflowId,
                Mandatory = payload.Mandatory
            }
            : d).ToList();

        return DeepClone(_docTypes[idx]);
    }

    public bool DeleteDocType(string id)
    {
        var before = _docTypes.Count;
        _docTypes = _docTypes.Where(d => d.Id != id).ToList();
        return _docTypes.Count != before;
    }

    public List<AdminDocType> ResetDocTypes() { var seed = new DocumentationInMemoryStore(); _docTypes = seed.GetDocTypes(); return DeepClone(_docTypes); }

    public List<AdminWorkflowDefinition> GetWorkflowDefinitions() => DeepClone(_workflowDefinitions);

    public AdminWorkflowDefinition? UpdateWorkflowDefinition(string id, AdminWorkflowDefinition next)
    {
        var idx = _workflowDefinitions.FindIndex(w => w.Id == id);
        if (idx == -1) return null;
        _workflowDefinitions = _workflowDefinitions.Select(w => w.Id == id ? next : w).ToList();
        return DeepClone(next);
    }

    public List<AdminWorkflowDefinition> ResetWorkflows() { var seed = new DocumentationInMemoryStore(); _workflowDefinitions = seed.GetWorkflowDefinitions(); return DeepClone(_workflowDefinitions); }

    public List<AdminPermissionPolicy> GetPermissionPolicies() => DeepClone(_permissionPolicies);
    public List<AdminPermissionPolicy> SavePermissionPolicies(List<AdminPermissionPolicy> next) { _permissionPolicies = DeepClone(next); return DeepClone(_permissionPolicies); }
    public List<AdminPermissionPolicy> ResetPermissionPolicies() { var seed = new DocumentationInMemoryStore(); _permissionPolicies = seed.GetPermissionPolicies(); return DeepClone(_permissionPolicies); }

    public AdminStorageConfig GetStorageConfig() => DeepClone(_storageConfig);
    public AdminStorageConfig SaveStorageConfig(AdminStorageConfig next) { _storageConfig = DeepClone(next); return DeepClone(_storageConfig); }
    public AdminStorageConfig ResetStorageConfig() { var seed = new DocumentationInMemoryStore(); _storageConfig = seed.GetStorageConfig(); return DeepClone(_storageConfig); }

    public List<string> GetAdminRoles() => ["Admin", "RH", "Manager", "Audit"];
}

// -----------------------------
// Controller
// -----------------------------

[ApiController]
[Route("api/documentation")]
public class DocumentationController(DocumentationInMemoryStore store) : ControllerBase
{
    // General config
    [HttpGet("general-config")]
    public ActionResult<AdminGeneralConfig> GetGeneralConfig() => store.GetGeneralConfig();

    [HttpPut("general-config")]
    public ActionResult<AdminGeneralConfig> SaveGeneralConfig([FromBody] AdminGeneralConfig next) => store.SaveGeneralConfig(next);

    [HttpPost("general-config/reset")]
    public ActionResult<AdminGeneralConfig> ResetGeneralConfig() => store.ResetGeneralConfig();

    // Doc types
    [HttpGet("doc-types")]
    public ActionResult<List<AdminDocType>> GetDocTypes() => store.GetDocTypes();

    [HttpPost("doc-types")]
    public ActionResult<AdminDocType> CreateDocType([FromBody] CreateDocTypeRequest payload) => store.CreateDocType(payload);

    [HttpPut("doc-types/{id}")]
    public ActionResult<AdminDocType> UpdateDocType(string id, [FromBody] UpdateDocTypeRequest payload)
    {
        var updated = store.UpdateDocType(id, payload);
        if (updated is null) return NotFound();
        return updated;
    }

    [HttpDelete("doc-types/{id}")]
    public ActionResult<bool> DeleteDocType(string id) => store.DeleteDocType(id);

    [HttpPost("doc-types/reset")]
    public ActionResult<List<AdminDocType>> ResetDocTypes() => store.ResetDocTypes();

    // Workflows
    [HttpGet("workflow-definitions")]
    public ActionResult<List<AdminWorkflowDefinition>> GetWorkflowDefinitions() => store.GetWorkflowDefinitions();

    [HttpPut("workflow-definitions/{id}")]
    public ActionResult<AdminWorkflowDefinition> UpdateWorkflowDefinition(string id, [FromBody] AdminWorkflowDefinition next)
    {
        // Ensure id consistency even if client omits it.
        next.Id = id;
        var updated = store.UpdateWorkflowDefinition(id, next);
        if (updated is null) return NotFound();
        return updated;
    }

    [HttpPost("workflow-definitions/reset")]
    public ActionResult<List<AdminWorkflowDefinition>> ResetWorkflows() => store.ResetWorkflows();

    // Permission policies
    [HttpGet("permission-policies")]
    public ActionResult<List<AdminPermissionPolicy>> GetPermissionPolicies() => store.GetPermissionPolicies();

    [HttpPut("permission-policies")]
    public ActionResult<List<AdminPermissionPolicy>> SavePermissionPolicies([FromBody] List<AdminPermissionPolicy> next) =>
        store.SavePermissionPolicies(next);

    [HttpPost("permission-policies/reset")]
    public ActionResult<List<AdminPermissionPolicy>> ResetPermissionPolicies() => store.ResetPermissionPolicies();

    // Storage config
    [HttpGet("storage-config")]
    public ActionResult<AdminStorageConfig> GetStorageConfig() => store.GetStorageConfig();

    [HttpPut("storage-config")]
    public ActionResult<AdminStorageConfig> SaveStorageConfig([FromBody] AdminStorageConfig next) => store.SaveStorageConfig(next);

    [HttpPost("storage-config/reset")]
    public ActionResult<AdminStorageConfig> ResetStorageConfig() => store.ResetStorageConfig();

    // Roles
    [HttpGet("admin-roles")]
    public ActionResult<List<string>> GetAdminRoles() => store.GetAdminRoles();
}

