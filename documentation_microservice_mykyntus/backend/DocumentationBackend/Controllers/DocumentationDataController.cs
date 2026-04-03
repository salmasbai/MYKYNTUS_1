using System.Data;
using DocumentationBackend.Api;
using DocumentationBackend.Context;
using DocumentationBackend.Data;
using DocumentationBackend.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;

namespace DocumentationBackend.Controllers;

/// <summary>
/// Données métier PostgreSQL (schéma documentation). Pas de mock : lecture/écriture réelle.
/// Le contexte utilisateur est injecté par en-têtes (voir <see cref="DocumentationUserContextMiddleware"/>).
/// </summary>
[ApiController]
[Route("api/documentation/data")]
public class DocumentationDataController(
    DocumentationDbContext db,
    DocumentationUserContext userContext) : ControllerBase
{
    private const string PostgresUniqueViolationSqlState = "23505";

    [HttpGet("document-types")]
    public async Task<ActionResult<IReadOnlyList<DocumentTypeResponse>>> GetDocumentTypes(CancellationToken ct)
    {
        var rows = await db.DocumentTypes
            .AsNoTracking()
            .OrderBy(t => t.Code)
            .Select(t => new DocumentTypeResponse(
                t.Id.ToString(),
                t.Name,
                t.Code,
                t.Description ?? "",
                t.DepartmentCode ?? "",
                t.RetentionDays,
                t.WorkflowId.HasValue ? t.WorkflowId.Value.ToString() : "",
                t.IsMandatory))
            .ToListAsync(ct);

        return rows;
    }

    [HttpGet("document-requests")]
    public async Task<ActionResult<PagedResponse<DocumentRequestResponse>>> GetDocumentRequests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] string? role = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        if (!TryParseSortOrder(sortOrder, out var desc))
            return BadRequest(new { message = "sortOrder doit être « asc » ou « desc »." });

        DocumentRequestStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<DocumentRequestStatus>(status.Trim(), ignoreCase: true, out var st))
                return BadRequest(new { message = "status invalide (pending, approved, rejected, generated, cancelled)." });
            statusFilter = st;
        }

        AppRole? roleFilter = null;
        if (!string.IsNullOrWhiteSpace(role))
        {
            if (!AppRoleHeaderParser.TryParse(role, out var rf))
                return BadRequest(new { message = "role de filtre invalide (pilote, coach, manager, rp, rh, admin, audit)." });
            roleFilter = rf;
        }

        string? typeNorm = string.IsNullOrWhiteSpace(type) ? null : type.Trim();
        Guid? filterTypeId = null;
        bool? catalogOnly = null;
        bool? customOnly = null;
        if (typeNorm is not null)
        {
            var tl = typeNorm.ToLowerInvariant();
            if (tl is "catalog" or "catalogue")
                catalogOnly = true;
            else if (tl is "custom" or "autre" or "other")
                customOnly = true;
            else if (Guid.TryParse(typeNorm, out var tid) && tid != Guid.Empty)
                filterTypeId = tid;
            else
                return BadRequest(new { message = "type doit être catalog, custom ou un UUID de type de document." });
        }

        if (!TryParseRequestSortField(sortBy, out var sortField))
            return BadRequest(new { message = "sortBy doit être createdAt, status ou requestNumber." });

        // Pas de Include ici : évite les jointures EF/Npgsql problématiques (traduction SQL, enums) sur certaines bases.
        var baseQuery = db.DocumentRequests.AsNoTracking();

        if (statusFilter.HasValue)
            baseQuery = baseQuery.Where(r => r.Status == statusFilter.Value);

        if (catalogOnly == true)
            baseQuery = baseQuery.Where(r => !r.IsCustomType);
        if (customOnly == true)
            baseQuery = baseQuery.Where(r => r.IsCustomType);
        if (filterTypeId.HasValue)
            baseQuery = baseQuery.Where(r => r.DocumentTypeId == filterTypeId.Value);

        if (roleFilter.HasValue)
        {
            var ids = DemoActors.GetUserIdsForRole(roleFilter.Value);
            baseQuery = baseQuery.Where(r => ids.Contains(r.RequesterUserId));
        }

        baseQuery = ApplyDocumentRequestSort(baseQuery, sortField, desc);

        var total = await baseQuery.CountAsync(ct);
        var rows = await baseQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var typeIds = rows.Where(r => r.DocumentTypeId.HasValue).Select(r => r.DocumentTypeId!.Value).Distinct().ToArray();
        var typeMap = typeIds.Length == 0
            ? new Dictionary<Guid, DocumentType>()
            : await db.DocumentTypes.AsNoTracking()
                .Where(t => typeIds.Contains(t.Id))
                .ToDictionaryAsync(t => t.Id, ct);

        var items = rows.Select(r =>
        {
            DocumentType? typeRow = null;
            if (r.DocumentTypeId.HasValue && typeMap.TryGetValue(r.DocumentTypeId.Value, out var dt))
                typeRow = dt;
            return DocumentRequestMapper.ToResponse(r, typeRow, userContext);
        }).ToList();
        return new PagedResponse<DocumentRequestResponse>(items, total, page, pageSize);
    }

    [HttpGet("document-requests/{id:guid}")]
    public async Task<ActionResult<DocumentRequestResponse>> GetDocumentRequest(Guid id, CancellationToken ct)
    {
        var r = await db.DocumentRequests
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (r is null)
            return NotFound();

        DocumentType? typeRow = null;
        if (r.DocumentTypeId.HasValue)
            typeRow = await db.DocumentTypes.AsNoTracking().FirstOrDefaultAsync(t => t.Id == r.DocumentTypeId.Value, ct);

        return DocumentRequestMapper.ToResponse(r, typeRow, userContext);
    }

    [HttpPost("document-requests")]
    public async Task<ActionResult<DocumentRequestResponse>> CreateDocumentRequest(
        [FromBody] CreateDocumentRequestBody body,
        CancellationToken ct)
    {
        var requesterId = userContext.UserId!.Value;

        if (body.RequesterUserId.HasValue && body.RequesterUserId.Value != Guid.Empty &&
            body.RequesterUserId.Value != requesterId)
            return BadRequest(new { message = "requesterUserId ne correspond pas au contexte utilisateur." });

        Guid? documentTypeId = null;
        if (body.IsCustomType)
        {
            if (!string.IsNullOrWhiteSpace(body.DocumentTypeId))
                return BadRequest(new { message = "Pour « Autre », ne pas envoyer documentTypeId." });
            if (string.IsNullOrWhiteSpace(body.CustomTypeDescription))
                return BadRequest(new { message = "Description du type obligatoire pour « Autre »." });
        }
        else
        {
            if (string.IsNullOrWhiteSpace(body.DocumentTypeId) || !Guid.TryParse(body.DocumentTypeId, out var dt) || dt == Guid.Empty)
                return BadRequest(new { message = "documentTypeId invalide." });
            var exists = await db.DocumentTypes.AnyAsync(t => t.Id == dt && t.IsActive, ct);
            if (!exists)
                return BadRequest(new { message = "Type de document inconnu ou inactif." });
            documentTypeId = dt;
        }

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        string requestNumber;
        try
        {
            requestNumber = await AllocateRequestNumberAsync(db, ct);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            return Problem(detail: ex.Message, title: "Numérotation indisponible");
        }

        var now = DateTimeOffset.UtcNow;
        var entity = new DocumentRequest
        {
            Id = Guid.NewGuid(),
            RequestNumber = requestNumber,
            RequesterUserId = requesterId,
            BeneficiaryUserId = body.BeneficiaryUserId,
            DocumentTypeId = body.IsCustomType ? null : documentTypeId,
            IsCustomType = body.IsCustomType,
            CustomTypeDescription = body.IsCustomType ? body.CustomTypeDescription!.Trim() : null,
            Reason = string.IsNullOrWhiteSpace(body.Reason) ? null : body.Reason.Trim(),
            ComplementaryComments = string.IsNullOrWhiteSpace(body.ComplementaryComments) ? null : body.ComplementaryComments.Trim(),
            Status = DocumentRequestStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.DocumentRequests.Add(entity);

        try
        {
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg && pg.SqlState == PostgresUniqueViolationSqlState)
        {
            await tx.RollbackAsync(ct);
            return Conflict(new { message = "Conflit d'unicité (numéro ou identifiant). Réessayez." });
        }
        catch (DbUpdateException ex)
        {
            await tx.RollbackAsync(ct);
            return BadRequest(new { message = "Enregistrement refusé par la base.", detail = ex.InnerException?.Message ?? ex.Message });
        }

        DocumentType? typeRow = null;
        if (!entity.IsCustomType && entity.DocumentTypeId.HasValue)
            typeRow = await db.DocumentTypes.AsNoTracking().FirstOrDefaultAsync(t => t.Id == entity.DocumentTypeId.Value, ct);

        return Ok(DocumentRequestMapper.ToResponse(entity, typeRow, userContext));
    }

    private static async Task<string> AllocateRequestNumberAsync(DocumentationDbContext db, CancellationToken ct)
    {
        var connection = (NpgsqlConnection)db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(ct);

        await using var cmd = connection.CreateCommand();
        if (db.Database.CurrentTransaction is { } efTx)
            cmd.Transaction = (NpgsqlTransaction)efTx.GetDbTransaction();
        cmd.CommandText = "SELECT documentation.next_document_request_number()";
        var result = await cmd.ExecuteScalarAsync(ct);
        if (result is not string s || string.IsNullOrWhiteSpace(s))
            throw new InvalidOperationException("next_document_request_number a renvoyé une valeur vide.");
        return s;
    }

    [HttpGet("audit-logs")]
    public async Task<ActionResult<PagedResponse<AuditLogResponse>>> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? action = null,
        [FromQuery] string? role = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        if (!TryParseSortOrder(sortOrder, out var desc))
            return BadRequest(new { message = "sortOrder doit être « asc » ou « desc »." });

        AppRole? roleFilter = null;
        if (!string.IsNullOrWhiteSpace(role))
        {
            if (!AppRoleHeaderParser.TryParse(role, out var rf))
                return BadRequest(new { message = "role de filtre invalide (pilote, coach, manager, rp, rh, admin, audit)." });
            roleFilter = rf;
        }

        if (!TryParseAuditSortField(sortBy, out var sortField))
            return BadRequest(new { message = "sortBy doit être occurredAt ou action." });

        var query = db.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(action))
        {
            var a = action.Trim();
            query = query.Where(x => x.Action.Contains(a));
        }

        if (roleFilter.HasValue)
        {
            var ids = DemoActors.GetUserIdsForRole(roleFilter.Value);
            query = query.Where(x => x.ActorUserId.HasValue && ids.Contains(x.ActorUserId.Value));
        }

        query = ApplyAuditSort(query, sortField, desc);

        var total = await query.CountAsync(ct);
        var rows = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = rows.Select(a => new AuditLogResponse(
            a.Id.ToString(),
            a.OccurredAt.ToString("O"),
            a.ActorUserId.HasValue ? DemoActors.ResolveDisplayName(a.ActorUserId.Value) : null,
            a.ActorUserId.HasValue ? a.ActorUserId.Value.ToString() : null,
            a.Action,
            a.EntityType,
            a.EntityId.HasValue ? a.EntityId.Value.ToString() : null,
            a.Success,
            a.ErrorMessage,
            a.CorrelationId.HasValue ? a.CorrelationId.Value.ToString() : null)).ToList();

        return new PagedResponse<AuditLogResponse>(items, total, page, pageSize);
    }

    private static string ResolveDirectoryTenant(DocumentationUserContext ctx) =>
        string.IsNullOrWhiteSpace(ctx.TenantId) ? "atlas-tech-demo" : ctx.TenantId.Trim();

    /// <summary>Liste l’annuaire du tenant courant (en-tête <c>X-Tenant-Id</c> ou défaut démo).</summary>
    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<DirectoryUserResponse>>> GetDirectoryUsers(CancellationToken ct)
    {
        var tenant = ResolveDirectoryTenant(userContext);
        var rows = await db.DirectoryUsers.AsNoTracking()
            .Where(u => u.TenantId == tenant)
            .OrderBy(u => u.Nom)
            .ThenBy(u => u.Prenom)
            .ToListAsync(ct);
        return rows.Select(DirectoryUserMapper.ToResponse).ToList();
    }

    /// <summary>Profil de l’utilisateur identifié par <c>X-User-Id</c>.</summary>
    [HttpGet("users/me")]
    public async Task<ActionResult<DirectoryUserResponse>> GetDirectoryUserMe(CancellationToken ct)
    {
        if (!userContext.UserId.HasValue)
            return Unauthorized();
        var tenant = ResolveDirectoryTenant(userContext);
        var row = await db.DirectoryUsers.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userContext.UserId.Value && u.TenantId == tenant, ct);
        if (row is null)
            return NotFound(new { message = "Utilisateur absent de l’annuaire pour ce tenant." });
        return DirectoryUserMapper.ToResponse(row);
    }

    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<DirectoryUserResponse>> GetDirectoryUser(Guid id, CancellationToken ct)
    {
        var tenant = ResolveDirectoryTenant(userContext);
        var row = await db.DirectoryUsers.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenant, ct);
        if (row is null)
            return NotFound();
        return DirectoryUserMapper.ToResponse(row);
    }

    public sealed class CreateDocumentRequestBody
    {
        public Guid? RequesterUserId { get; set; }
        public Guid? BeneficiaryUserId { get; set; }
        public string? DocumentTypeId { get; set; }
        public bool IsCustomType { get; set; }
        public string? CustomTypeDescription { get; set; }
        public string? Reason { get; set; }
        public string? ComplementaryComments { get; set; }
    }

    private static bool TryParseSortOrder(string? sortOrder, out bool descending)
    {
        descending = true;
        if (string.IsNullOrWhiteSpace(sortOrder))
            return true;

        var s = sortOrder.Trim().ToLowerInvariant();
        if (s == "asc")
        {
            descending = false;
            return true;
        }

        if (s == "desc")
            return true;

        return false;
    }

    private enum RequestSortField
    {
        CreatedAt,
        Status,
        RequestNumber,
    }

    private enum AuditSortField
    {
        OccurredAt,
        Action,
    }

    private static bool TryParseRequestSortField(string? sortBy, out RequestSortField field)
    {
        field = RequestSortField.CreatedAt;
        if (string.IsNullOrWhiteSpace(sortBy))
            return true;

        switch (sortBy.Trim().ToLowerInvariant())
        {
            case "createdat":
                field = RequestSortField.CreatedAt;
                return true;
            case "status":
                field = RequestSortField.Status;
                return true;
            case "requestnumber":
                field = RequestSortField.RequestNumber;
                return true;
            default:
                return false;
        }
    }

    private static bool TryParseAuditSortField(string? sortBy, out AuditSortField field)
    {
        field = AuditSortField.OccurredAt;
        if (string.IsNullOrWhiteSpace(sortBy))
            return true;

        switch (sortBy.Trim().ToLowerInvariant())
        {
            case "occurredat":
                field = AuditSortField.OccurredAt;
                return true;
            case "action":
                field = AuditSortField.Action;
                return true;
            default:
                return false;
        }
    }

    private static IQueryable<DocumentRequest> ApplyDocumentRequestSort(IQueryable<DocumentRequest> q, RequestSortField sortField, bool desc) =>
        sortField switch
        {
            RequestSortField.Status => desc
                ? q.OrderByDescending(r => r.Status).ThenByDescending(r => r.CreatedAt)
                : q.OrderBy(r => r.Status).ThenByDescending(r => r.CreatedAt),
            RequestSortField.RequestNumber => desc
                ? q.OrderByDescending(r => r.RequestNumber).ThenByDescending(r => r.CreatedAt)
                : q.OrderBy(r => r.RequestNumber).ThenByDescending(r => r.CreatedAt),
            _ => desc ? q.OrderByDescending(r => r.CreatedAt) : q.OrderBy(r => r.CreatedAt),
        };

    private static IQueryable<AuditLog> ApplyAuditSort(IQueryable<AuditLog> q, AuditSortField sortField, bool desc) =>
        sortField switch
        {
            AuditSortField.Action => desc
                ? q.OrderByDescending(a => a.Action).ThenByDescending(a => a.OccurredAt)
                : q.OrderBy(a => a.Action).ThenByDescending(a => a.OccurredAt),
            _ => desc ? q.OrderByDescending(a => a.OccurredAt) : q.OrderBy(a => a.OccurredAt),
        };
}
