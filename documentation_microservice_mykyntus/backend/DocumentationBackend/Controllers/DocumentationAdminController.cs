using DocumentationBackend.Api;
using DocumentationBackend.Data;
using DocumentationBackend.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DocumentationBackend.Controllers;

/// <summary>Administration DMS — persistance PostgreSQL (schéma documentation). Remplace l’ancien store mémoire.</summary>
[ApiController]
[Route("api/documentation")]
public sealed class DocumentationAdminController(
    DocumentationDbContext db,
    ILogger<DocumentationAdminController> logger) : ControllerBase
{
    [HttpGet("general-config")]
    public async Task<ActionResult<AdminGeneralConfigDto>> GetGeneralConfig(CancellationToken ct)
    {
        var row = await db.DmsGeneralConfigurations.AsNoTracking().OrderBy(x => x.Id).FirstOrDefaultAsync(ct);
        if (row is null)
            return NotFound(new { message = "Aucune configuration générale en base. Exécutez les scripts SQL (001 + 009)." });
        return Ok(MapGeneral(row));
    }

    [HttpPut("general-config")]
    public async Task<ActionResult<AdminGeneralConfigDto>> SaveGeneralConfig([FromBody] AdminGeneralConfigDto body, CancellationToken ct)
    {
        var row = await db.DmsGeneralConfigurations.OrderBy(x => x.Id).FirstOrDefaultAsync(ct);
        if (row is null)
            return NotFound();
        ApplyGeneral(row, body);
        row.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(MapGeneral(row));
    }

    [HttpPost("general-config/reset")]
    public Task<ActionResult<AdminGeneralConfigDto>> ResetGeneralConfig(CancellationToken ct) =>
        GetGeneralConfig(ct);

    [HttpGet("doc-types")]
    public async Task<ActionResult<List<AdminDocTypeDto>>> GetDocTypes(CancellationToken ct)
    {
        var rows = await db.DocumentTypes.AsNoTracking().OrderBy(t => t.Code).ToListAsync(ct);
        return Ok(rows.Select(MapDocType).ToList());
    }

    [HttpPost("doc-types")]
    public async Task<ActionResult<AdminDocTypeDto>> CreateDocType([FromBody] CreateDocTypeRequestDto payload, CancellationToken ct)
    {
        if (!Guid.TryParse(payload.WorkflowId, out var wfId) || wfId == Guid.Empty)
            return BadRequest(new { message = "workflowId invalide." });
        var wfExists = await db.Workflows.AnyAsync(w => w.Id == wfId, ct);
        if (!wfExists)
            return BadRequest(new { message = "Workflow introuvable." });

        var now = DateTimeOffset.UtcNow;
        var entity = new DocumentType
        {
            Id = Guid.NewGuid(),
            Code = payload.Code.Trim(),
            Name = payload.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(payload.Description) ? null : payload.Description.Trim(),
            DepartmentCode = string.IsNullOrWhiteSpace(payload.Department) ? null : payload.Department.Trim(),
            RetentionDays = payload.RetentionDays,
            WorkflowId = wfId,
            IsMandatory = payload.Mandatory,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.DocumentTypes.Add(entity);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Code déjà utilisé ou contrainte refusée." });
        }

        logger.LogInformation("Admin CreateDocType id={Id} code={Code}", entity.Id, entity.Code);
        return Ok(MapDocType(entity));
    }

    [HttpPut("doc-types/{id:guid}")]
    public async Task<ActionResult<AdminDocTypeDto>> UpdateDocType(Guid id, [FromBody] CreateDocTypeRequestDto payload, CancellationToken ct)
    {
        var entity = await db.DocumentTypes.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (entity is null)
            return NotFound();
        if (!Guid.TryParse(payload.WorkflowId, out var wfId) || wfId == Guid.Empty)
            return BadRequest(new { message = "workflowId invalide." });
        if (!await db.Workflows.AnyAsync(w => w.Id == wfId, ct))
            return BadRequest(new { message = "Workflow introuvable." });

        entity.Code = payload.Code.Trim();
        entity.Name = payload.Name.Trim();
        entity.Description = string.IsNullOrWhiteSpace(payload.Description) ? null : payload.Description.Trim();
        entity.DepartmentCode = string.IsNullOrWhiteSpace(payload.Department) ? null : payload.Department.Trim();
        entity.RetentionDays = payload.RetentionDays;
        entity.WorkflowId = wfId;
        entity.IsMandatory = payload.Mandatory;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Contrainte refusée." });
        }

        logger.LogInformation("Admin UpdateDocType id={Id}", id);
        return Ok(MapDocType(entity));
    }

    [HttpDelete("doc-types/{id:guid}")]
    public async Task<ActionResult<bool>> DeleteDocType(Guid id, CancellationToken ct)
    {
        var entity = await db.DocumentTypes.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (entity is null)
            return NotFound(false);
        db.DocumentTypes.Remove(entity);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Impossible de supprimer : références existantes." });
        }

        logger.LogInformation("Admin DeleteDocType id={Id}", id);
        return Ok(true);
    }

    [HttpPost("doc-types/reset")]
    public Task<ActionResult<List<AdminDocTypeDto>>> ResetDocTypes(CancellationToken ct) => GetDocTypes(ct);

    [HttpGet("workflow-definitions")]
    public async Task<ActionResult<List<AdminWorkflowDefinitionDto>>> GetWorkflowDefinitions(CancellationToken ct)
    {
        var workflows = await db.Workflows.AsNoTracking()
            .Include(w => w.Steps)
            .ThenInclude(s => s.Actions)
            .OrderBy(w => w.Name)
            .ToListAsync(ct);
        return Ok(workflows.Select(MapWorkflow).ToList());
    }

    [HttpPut("workflow-definitions/{id:guid}")]
    public async Task<ActionResult<AdminWorkflowDefinitionDto>> UpdateWorkflowDefinition(
        Guid id,
        [FromBody] AdminWorkflowDefinitionDto body,
        CancellationToken ct)
    {
        var wf = await db.Workflows
            .Include(w => w.Steps)
            .ThenInclude(s => s.Actions)
            .FirstOrDefaultAsync(w => w.Id == id, ct);
        if (wf is null)
            return NotFound();

        wf.Name = body.Name.Trim();
        wf.AuditEnabled = body.AuditAccess.Enabled;
        wf.AuditReadOnly = body.AuditAccess.ReadOnly;
        wf.AuditLogs = body.AuditAccess.Logs;
        wf.AuditHistory = body.AuditAccess.History;
        wf.AuditExport = body.AuditAccess.Export;
        wf.UpdatedAt = DateTimeOffset.UtcNow;

        db.WorkflowSteps.RemoveRange(wf.Steps);
        await db.SaveChangesAsync(ct);

        var order = 1;
        foreach (var stepDto in body.Steps)
        {
            if (!AppRoleHeaderParser.TryParse(stepDto.AssignedRole, out var role))
                return BadRequest(new { message = $"Rôle invalide à l’étape {stepDto.Key}." });
            var step = new WorkflowStep
            {
                Id = Guid.TryParse(stepDto.Id, out var sid) && sid != Guid.Empty ? sid : Guid.NewGuid(),
                WorkflowId = wf.Id,
                StepOrder = order++,
                StepKey = stepDto.Key.Trim(),
                Name = stepDto.Name.Trim(),
                AssignedRole = role,
                SlaHours = stepDto.SlaHours,
                NotificationKey = MapNotificationKey(stepDto.NotificationKey),
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
            };
            foreach (var a in stepDto.Actions)
            {
                if (!TryMapActionKey(a, out var ak))
                    return BadRequest(new { message = $"Action invalide : {a}" });
                step.Actions.Add(new WorkflowStepAction { Action = ak });
            }

            db.WorkflowSteps.Add(step);
        }

        await db.SaveChangesAsync(ct);
        var reloaded = await db.Workflows.AsNoTracking()
            .Include(w => w.Steps)
            .ThenInclude(s => s.Actions)
            .FirstAsync(w => w.Id == id, ct);
        logger.LogInformation("Admin UpdateWorkflowDefinition id={Id}", id);
        return Ok(MapWorkflow(reloaded));
    }

    [HttpPost("workflow-definitions/reset")]
    public Task<ActionResult<List<AdminWorkflowDefinitionDto>>> ResetWorkflows(CancellationToken ct) =>
        GetWorkflowDefinitions(ct);

    [HttpGet("permission-policies")]
    public async Task<ActionResult<List<AdminPermissionPolicyDto>>> GetPermissionPolicies(CancellationToken ct)
    {
        var rows = await db.PermissionPolicies.AsNoTracking()
            .OrderBy(p => p.Role)
            .ThenBy(p => p.Id)
            .ToListAsync(ct);
        return Ok(rows.Select(MapPermission).ToList());
    }

    [HttpPut("permission-policies")]
    public async Task<ActionResult<List<AdminPermissionPolicyDto>>> SavePermissionPolicies(
        [FromBody] List<AdminPermissionPolicyDto> body,
        CancellationToken ct)
    {
        var existing = await db.PermissionPolicies.ToListAsync(ct);
        db.PermissionPolicies.RemoveRange(existing);
        foreach (var p in body)
        {
            Guid? dtId = null;
            if (!string.IsNullOrWhiteSpace(p.DocTypeId) && Guid.TryParse(p.DocTypeId, out var dtParsed))
                dtId = dtParsed;
            if (!AppRoleHeaderParser.TryParse(p.Role, out var role))
                return BadRequest(new { message = $"Rôle invalide : {p.Role}" });
            if (!Guid.TryParse(p.Id, out var policyId) || policyId == Guid.Empty)
                policyId = Guid.NewGuid();
            db.PermissionPolicies.Add(new PermissionPolicy
            {
                Id = policyId,
                Role = role,
                DocumentTypeId = dtId,
                DepartmentCode = string.IsNullOrWhiteSpace(p.Department) ? null : p.Department.Trim(),
                CanRead = p.Permissions.Read,
                CanCreate = p.Permissions.Create,
                CanUpdate = p.Permissions.Update,
                CanDelete = p.Permissions.Delete,
                CanValidate = p.Permissions.Validate,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
            });
        }

        await db.SaveChangesAsync(ct);
        return await GetPermissionPolicies(ct);
    }

    [HttpPost("permission-policies/reset")]
    public Task<ActionResult<List<AdminPermissionPolicyDto>>> ResetPermissionPolicies(CancellationToken ct) =>
        GetPermissionPolicies(ct);

    [HttpGet("storage-config")]
    public async Task<ActionResult<AdminStorageConfigDto>> GetStorageConfig(CancellationToken ct)
    {
        var row = await db.DmsStorageConfigurations.AsNoTracking().OrderBy(x => x.Id).FirstOrDefaultAsync(ct);
        if (row is null)
            return NotFound();
        return Ok(MapStorage(row));
    }

    [HttpPut("storage-config")]
    public async Task<ActionResult<AdminStorageConfigDto>> SaveStorageConfig([FromBody] AdminStorageConfigDto body, CancellationToken ct)
    {
        var row = await db.DmsStorageConfigurations.OrderBy(x => x.Id).FirstOrDefaultAsync(ct);
        if (row is null)
            return NotFound();
        ApplyStorage(row, body);
        row.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(MapStorage(row));
    }

    [HttpPost("storage-config/reset")]
    public Task<ActionResult<AdminStorageConfigDto>> ResetStorageConfig(CancellationToken ct) => GetStorageConfig(ct);

    [HttpGet("admin-roles")]
    public ActionResult<List<string>> GetAdminRoles() =>
        Ok(Enum.GetNames<AppRole>().Select(NormalizeRoleLabel).ToList());

    private static AdminGeneralConfigDto MapGeneral(DmsGeneralConfiguration x) => new()
    {
        SystemName = x.SystemName,
        DefaultLanguage = x.DefaultLanguage,
        DefaultTimezone = x.DefaultTimezone,
        MaxFileSizeMB = x.MaxFileSizeMB,
        AllowedFileTypes = string.IsNullOrWhiteSpace(x.AllowedFileTypes)
            ? []
            : x.AllowedFileTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
        VersioningEnabled = x.VersioningEnabled,
        RetentionDays = x.RetentionDaysDefault,
        DocumentsMandatoryByType = x.DocumentsMandatoryByType,
        AutoNumberingEnabled = x.AutoNumberingEnabled,
        NumberingPattern = x.NumberingPattern,
        Security = new AdminSecurityDto
        {
            EncryptionEnabled = x.EncryptionEnabled,
            ExternalSharingEnabled = x.ExternalSharingEnabled,
            ElectronicSignatureEnabled = x.ElectronicSignatureEnabled,
        },
        Notifications = new AdminNotificationsDto
        {
            EmailOnUpload = x.EmailOnUpload,
            EmailOnValidation = x.EmailOnValidation,
            EmailOnRejection = x.EmailOnRejection,
            ReminderExpiredEnabled = x.ReminderExpiredEnabled,
        },
    };

    private static void ApplyGeneral(DmsGeneralConfiguration row, AdminGeneralConfigDto body)
    {
        row.SystemName = body.SystemName;
        row.DefaultLanguage = body.DefaultLanguage;
        row.DefaultTimezone = body.DefaultTimezone;
        row.MaxFileSizeMB = body.MaxFileSizeMB;
        row.AllowedFileTypes = string.Join(",", body.AllowedFileTypes);
        row.VersioningEnabled = body.VersioningEnabled;
        row.RetentionDaysDefault = body.RetentionDays;
        row.DocumentsMandatoryByType = body.DocumentsMandatoryByType;
        row.AutoNumberingEnabled = body.AutoNumberingEnabled;
        row.NumberingPattern = body.NumberingPattern;
        row.EncryptionEnabled = body.Security.EncryptionEnabled;
        row.ExternalSharingEnabled = body.Security.ExternalSharingEnabled;
        row.ElectronicSignatureEnabled = body.Security.ElectronicSignatureEnabled;
        row.EmailOnUpload = body.Notifications.EmailOnUpload;
        row.EmailOnValidation = body.Notifications.EmailOnValidation;
        row.EmailOnRejection = body.Notifications.EmailOnRejection;
        row.ReminderExpiredEnabled = body.Notifications.ReminderExpiredEnabled;
    }

    private static AdminDocTypeDto MapDocType(DocumentType t) => new()
    {
        Id = t.Id.ToString(),
        Name = t.Name,
        Code = t.Code,
        Description = t.Description ?? "",
        Department = t.DepartmentCode ?? "",
        RetentionDays = t.RetentionDays,
        WorkflowId = t.WorkflowId?.ToString() ?? "",
        Mandatory = t.IsMandatory,
    };

    private static AdminWorkflowDefinitionDto MapWorkflow(Workflow w) => new()
    {
        Id = w.Id.ToString(),
        Name = w.Name,
        Steps = w.Steps.OrderBy(s => s.StepOrder).Select(s => new AdminWorkflowStepDto
        {
            Id = s.Id.ToString(),
            Key = s.StepKey,
            Name = s.Name,
            AssignedRole = NormalizeRoleLabel(s.AssignedRole.ToString()),
            Actions = s.Actions.Select(a => Capitalize(a.Action.ToString())).ToList(),
            SlaHours = s.SlaHours,
            NotificationKey = s.NotificationKey.ToString().ToLowerInvariant() == "none" ? "none" : "email",
        }).ToList(),
        AuditAccess = new AdminWorkflowAuditDto
        {
            Enabled = w.AuditEnabled,
            ReadOnly = w.AuditReadOnly,
            Logs = w.AuditLogs,
            History = w.AuditHistory,
            Export = w.AuditExport,
        },
    };

    private static AdminPermissionPolicyDto MapPermission(PermissionPolicy p) => new()
    {
        Id = p.Id.ToString(),
        Role = NormalizeRoleLabel(p.Role.ToString()),
        DocTypeId = p.DocumentTypeId?.ToString(),
        Department = p.DepartmentCode,
        Permissions = new AdminPermissionSetDto
        {
            Read = p.CanRead,
            Create = p.CanCreate,
            Update = p.CanUpdate,
            Delete = p.CanDelete,
            Validate = p.CanValidate,
        },
    };

    private static AdminStorageConfigDto MapStorage(DmsStorageConfiguration x) => new()
    {
        StorageType = x.StorageType == StorageType.Local ? "Local" : "Cloud",
        ApiUrl = x.ApiUrl ?? "",
        BucketName = x.BucketName ?? "",
        Region = x.Region ?? "",
        AccessKey = x.AccessKeyReference ?? "",
        BackupEnabled = x.BackupEnabled,
        CompressionEnabled = x.CompressionEnabled,
    };

    private static void ApplyStorage(DmsStorageConfiguration row, AdminStorageConfigDto body)
    {
        row.StorageType = string.Equals(body.StorageType, "Local", StringComparison.OrdinalIgnoreCase)
            ? StorageType.Local
            : StorageType.Cloud;
        row.ApiUrl = body.ApiUrl;
        row.BucketName = body.BucketName;
        row.Region = body.Region;
        row.AccessKeyReference = body.AccessKey;
        row.BackupEnabled = body.BackupEnabled;
        row.CompressionEnabled = body.CompressionEnabled;
    }

    private static WorkflowNotificationKey MapNotificationKey(string key) =>
        string.Equals(key, "none", StringComparison.OrdinalIgnoreCase)
            ? WorkflowNotificationKey.None
            : WorkflowNotificationKey.Email;

    private static bool TryMapActionKey(string label, out WorkflowActionKey ak)
    {
        ak = default;
        var s = label.Trim();
        foreach (WorkflowActionKey v in Enum.GetValues<WorkflowActionKey>())
        {
            if (string.Equals(v.ToString(), s, StringComparison.OrdinalIgnoreCase))
            {
                ak = v;
                return true;
            }
        }

        return false;
    }

    private static string Capitalize(string s) =>
        string.IsNullOrEmpty(s) ? s : char.ToUpperInvariant(s[0]) + s[1..].ToLowerInvariant();

    private static string NormalizeRoleLabel(string role) => role.ToLowerInvariant() switch
    {
        "pilote" => "Pilote",
        "coach" => "Coach",
        "manager" => "Manager",
        "rp" => "RP",
        "rh" => "RH",
        "admin" => "Admin",
        "audit" => "Audit",
        _ => role,
    };
}
