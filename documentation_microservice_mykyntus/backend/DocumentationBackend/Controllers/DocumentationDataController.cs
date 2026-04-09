using System.Data;
using DocumentationBackend.Api;
using DocumentationBackend.Context;
using DocumentationBackend.Data;
using DocumentationBackend.Data.Entities;
using DocumentationBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    DocumentationUserContext userContext,
    IDocumentationTenantAccessor tenantAccessor) : ControllerBase
{
    private const string PostgresUniqueViolationSqlState = "23505";

    /// <summary>Libellé normalisé pour filtrer <c>unit_type</c> (comparaison en minuscules côté requête).</summary>
    private const string OrgUnitTypePole = "pole";

    private const string OrgUnitTypeCellule = "cellule";

    private const string OrgUnitTypeDepartement = "departement";

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

    /// <summary>
    /// Demandes paginées du tenant courant. Total 0 → 200 avec page vide. Erreurs SQL/mapping → middleware global.
    /// </summary>
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
            var roleUserIds = await db.DirectoryUsers.AsNoTracking()
                .Where(u => u.Role == roleFilter.Value)
                .Select(u => u.Id)
                .ToListAsync(ct);
            baseQuery = roleUserIds.Count > 0
                ? baseQuery.Where(r => roleUserIds.Contains(r.RequesterUserId))
                : baseQuery.Where(static r => false);
        }

        // Périmètre hiérarchique (manager / RP) : demandes des pilotes encadrés par le coach choisi.
        if (userContext.ScopeCoachId.HasValue &&
            userContext.Role is AppRole.Manager or AppRole.Rp)
        {
            var pilotIds = await db.DirectoryUsers.AsNoTracking()
                .Where(u => u.CoachId == userContext.ScopeCoachId && u.Role == AppRole.Pilote)
                .Select(u => u.Id)
                .ToListAsync(ct);
            baseQuery = pilotIds.Count > 0
                ? baseQuery.Where(r => pilotIds.Contains(r.RequesterUserId))
                : baseQuery.Where(static r => false);
        }
        else if (userContext.ScopeManagerId.HasValue && !userContext.ScopeCoachId.HasValue &&
                 userContext.Role == AppRole.Rp)
        {
            var coachIds = await db.DirectoryUsers.AsNoTracking()
                .Where(u => u.Role == AppRole.Coach && u.ManagerId == userContext.ScopeManagerId)
                .Select(u => u.Id)
                .ToListAsync(ct);
            var pilotIds = await db.DirectoryUsers.AsNoTracking()
                .Where(u => u.Role == AppRole.Pilote && u.CoachId.HasValue && coachIds.Contains(u.CoachId!.Value))
                .Select(u => u.Id)
                .ToListAsync(ct);
            baseQuery = pilotIds.Count > 0
                ? baseQuery.Where(r => pilotIds.Contains(r.RequesterUserId))
                : baseQuery.Where(static r => false);
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

        var nameIds = rows.SelectMany(r => new[] { r.RequesterUserId, r.BeneficiaryUserId ?? Guid.Empty }).ToArray();
        var displayNames = await DocumentRequestMappingHelper.LoadDisplayNamesAsync(db, nameIds, ct);

        var items = rows.Select(r =>
        {
            DocumentType? typeRow = null;
            if (r.DocumentTypeId.HasValue && typeMap.TryGetValue(r.DocumentTypeId.Value, out var dt))
                typeRow = dt;
            return DocumentRequestMapper.ToResponse(r, typeRow, userContext, displayNames);
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

        var names = await DocumentRequestMappingHelper.LoadDisplayNamesAsync(
            db,
            new[] { r.RequesterUserId, r.BeneficiaryUserId ?? Guid.Empty },
            ct);
        return DocumentRequestMapper.ToResponse(r, typeRow, userContext, names);
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
            requestNumber = await DocumentRequestNumberingService.AllocateNextAsync(db, tenantAccessor.ResolvedTenantId, ct);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            return Problem(detail: ex.Message, title: "Numérotation indisponible");
        }

        var requesterRow = await db.DirectoryUsers.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == requesterId, ct);

        var now = DateTimeOffset.UtcNow;
        var entity = new DocumentRequest
        {
            Id = Guid.NewGuid(),
            TenantId = tenantAccessor.ResolvedTenantId,
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
            OrganizationalUnitId = requesterRow?.DepartementId,
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

        var displayNames = await DocumentRequestMappingHelper.LoadDisplayNamesAsync(
            db,
            new[] { entity.RequesterUserId, entity.BeneficiaryUserId ?? Guid.Empty },
            ct);
        return Ok(DocumentRequestMapper.ToResponse(entity, typeRow, userContext, displayNames));
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
            var actorIdsForRole = await db.DirectoryUsers.AsNoTracking()
                .Where(u => u.Role == roleFilter.Value)
                .Select(u => u.Id)
                .ToListAsync(ct);
            query = actorIdsForRole.Count > 0
                ? query.Where(x => x.ActorUserId.HasValue && actorIdsForRole.Contains(x.ActorUserId.Value))
                : query.Where(static x => false);
        }

        query = ApplyAuditSort(query, sortField, desc);

        var total = await query.CountAsync(ct);
        var rows = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var auditActorIds = rows.Where(a => a.ActorUserId.HasValue).Select(a => a.ActorUserId!.Value).ToArray();
        var auditNames = await DocumentRequestMappingHelper.LoadDisplayNamesAsync(db, auditActorIds, ct);

        var items = rows.Select(a => new AuditLogResponse(
            a.Id.ToString(),
            a.OccurredAt.ToString("O"),
            a.ActorUserId.HasValue ? DocumentRequestMappingHelper.ResolveName(auditNames, a.ActorUserId.Value) : null,
            a.ActorUserId.HasValue ? a.ActorUserId.Value.ToString() : null,
            a.Action,
            a.EntityType,
            a.EntityId.HasValue ? a.EntityId.Value.ToString() : null,
            a.Success,
            a.ErrorMessage,
            a.CorrelationId.HasValue ? a.CorrelationId.Value.ToString() : null)).ToList();

        return new PagedResponse<AuditLogResponse>(items, total, page, pageSize);
    }

    [HttpGet("document-templates")]
    public async Task<ActionResult<IReadOnlyList<DocumentTemplateListItemResponse>>> GetDocumentTemplates(CancellationToken ct)
    {
        var rows = await db.DocumentTemplates.AsNoTracking()
            .Include(t => t.DocumentType)
            .Include(t => t.Variables)
            .OrderBy(t => t.Code)
            .ToListAsync(ct);
        var list = rows.Select(t => new DocumentTemplateListItemResponse(
            t.Id.ToString(),
            t.Code,
            t.Name,
            t.DocumentTypeId?.ToString(),
            t.DocumentType?.Name,
            t.Variables.OrderBy(v => v.SortOrder).Select(v => v.VariableName).ToList(),
            t.UpdatedAt.ToString("O"))).ToList();
        return Ok(list);
    }

    [HttpPost("document-templates/{id:guid}/generate")]
    public async Task<ActionResult<DocumentTemplateGenerateResponse>> GenerateFromTemplate(
        Guid id,
        [FromBody] DocumentTemplateGenerateRequest? body,
        CancellationToken ct)
    {
        if (!userContext.UserId.HasValue)
            return Unauthorized();

        var template = await db.DocumentTemplates
            .Include(t => t.DocumentType)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
        if (template is null)
            return NotFound();

        var typeId = template.DocumentTypeId ?? body?.DocumentTypeId;
        if (!typeId.HasValue || typeId == Guid.Empty)
            return BadRequest(new { message = "Le modèle doit être lié à un type de document ou documentTypeId doit être fourni." });

        var now = DateTimeOffset.UtcNow;
        var fileName = $"GEN_{template.Code}_{now:yyyyMMddHHmmss}.pdf";
        var uri = $"https://storage.local/mykyntus/generated/{tenantAccessor.ResolvedTenantId}/{fileName}";
        var gen = new GeneratedDocument
        {
            Id = Guid.NewGuid(),
            DocumentRequestId = body?.DocumentRequestId,
            OwnerUserId = userContext.UserId.Value,
            DocumentTypeId = typeId,
            FileName = fileName,
            StorageUri = uri,
            MimeType = "application/pdf",
            FileSizeBytes = 0,
            Status = GeneratedDocumentStatus.Generated,
            VersionNumber = 1,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.GeneratedDocuments.Add(gen);
        await db.SaveChangesAsync(ct);
        return Ok(new DocumentTemplateGenerateResponse(gen.Id.ToString(), fileName, uri, gen.Status.ToString()));
    }

    /// <summary>
    /// Liste l’annuaire du tenant courant (filtre global EF). Aucune ligne en base → 200 avec liste vide (pas d’erreur).
    /// Les exceptions (ex. SQL) sont gérées par <c>UnhandledExceptionMiddleware</c> — pas de try/catch dupliqué ici.
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<DirectoryUserResponse>>> GetDirectoryUsers(CancellationToken ct)
    {
        var rows = await db.DirectoryUsers.AsNoTracking()
            .OrderBy(u => u.Nom)
            .ThenBy(u => u.Prenom)
            .ToListAsync(ct);
        return Ok(await MapDirectoryUsersAsync(rows, ct));
    }

    /// <summary>Profil de l’utilisateur identifié par <c>X-User-Id</c>.</summary>
    [HttpGet("users/me")]
    public async Task<ActionResult<DirectoryUserResponse>> GetDirectoryUserMe(CancellationToken ct)
    {
        if (!userContext.UserId.HasValue)
            return Unauthorized();
        var row = await db.DirectoryUsers.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userContext.UserId.Value, ct);
        if (row is null)
            return NotFound(new { message = "Utilisateur absent de l’annuaire pour ce tenant." });
        return await MapDirectoryUserAsync(row, ct);
    }

    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<DirectoryUserResponse>> GetDirectoryUser(Guid id, CancellationToken ct)
    {
        var row = await db.DirectoryUsers.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, ct);
        if (row is null)
            return NotFound();
        return await MapDirectoryUserAsync(row, ct);
    }

    [HttpGet("organisation/poles")]
    public Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> GetPoles(CancellationToken ct) =>
        QueryOrganisationPolesAsync(ct);

    /// <summary>Alias orthographe US (même handler) — utile si un proxy ou une ancienne config attend <c>organization</c>.</summary>
    [HttpGet("organization/poles")]
    public Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> GetPolesOrganizationSpelling(CancellationToken ct) =>
        QueryOrganisationPolesAsync(ct);

    [HttpGet("organisation/cellules")]
    public Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> GetCellulesByPole([FromQuery] Guid poleId, CancellationToken ct) =>
        QueryOrganisationCellulesByPoleAsync(poleId, ct);

    [HttpGet("organization/cellules")]
    public Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> GetCellulesByPoleOrganizationSpelling(
        [FromQuery] Guid poleId,
        CancellationToken ct) =>
        QueryOrganisationCellulesByPoleAsync(poleId, ct);

    [HttpGet("organisation/departements")]
    public Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> GetDepartementsByCellule(
        [FromQuery] Guid celluleId,
        CancellationToken ct) =>
        QueryOrganisationDepartementsByCelluleAsync(celluleId, ct);

    [HttpGet("organization/departements")]
    public Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> GetDepartementsByCelluleOrganizationSpelling(
        [FromQuery] Guid celluleId,
        CancellationToken ct) =>
        QueryOrganisationDepartementsByCelluleAsync(celluleId, ct);

    private async Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> QueryOrganisationPolesAsync(CancellationToken ct)
    {
        var rows = await db.OrganisationUnits.AsNoTracking()
            .Where(u => u.UnitType != null && u.UnitType.ToLower() == OrgUnitTypePole)
            .OrderBy(u => u.Name)
            .ToListAsync(ct);
        return rows.Select(u => new OrganizationalUnitSummary(u.Id.ToString(), u.Code, u.Name, u.UnitType)).ToList();
    }

    private async Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> QueryOrganisationCellulesByPoleAsync(
        Guid poleId,
        CancellationToken ct)
    {
        var rows = await db.OrganisationUnits.AsNoTracking()
            .Where(u => u.UnitType != null && u.UnitType.ToLower() == OrgUnitTypeCellule && u.ParentId == poleId)
            .OrderBy(u => u.Name)
            .ToListAsync(ct);
        return rows.Select(u => new OrganizationalUnitSummary(u.Id.ToString(), u.Code, u.Name, u.UnitType)).ToList();
    }

    private async Task<ActionResult<IReadOnlyList<OrganizationalUnitSummary>>> QueryOrganisationDepartementsByCelluleAsync(
        Guid celluleId,
        CancellationToken ct)
    {
        var rows = await db.OrganisationUnits.AsNoTracking()
            .Where(u => u.UnitType != null && u.UnitType.ToLower() == OrgUnitTypeDepartement && u.ParentId == celluleId)
            .OrderBy(u => u.Name)
            .ToListAsync(ct);
        return rows.Select(u => new OrganizationalUnitSummary(u.Id.ToString(), u.Code, u.Name, u.UnitType)).ToList();
    }

    /// <summary>Utilisateurs filtrés par rôle applicatif et rattachement organisationnel (pôle, cellule, département).</summary>
    [HttpGet("users/by-role-org")]
    public async Task<ActionResult<IReadOnlyList<DirectoryUserResponse>>> GetUsersByRoleAndOrg(
        [FromQuery] string role,
        [FromQuery] Guid poleId,
        [FromQuery] Guid celluleId,
        [FromQuery] Guid departementId,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(role) || !AppRoleHeaderParser.TryParse(role, out var appRole))
            return BadRequest(new { message = "role invalide (pilote, coach, manager, rp, rh, admin, audit)." });

        var rows = await db.DirectoryUsers.AsNoTracking()
            .Where(u =>
                u.Role == appRole &&
                u.PoleId == poleId &&
                u.CelluleId == celluleId &&
                u.DepartementId == departementId)
            .OrderBy(u => u.Nom)
            .ThenBy(u => u.Prenom)
            .ToListAsync(ct);
        return Ok(await MapDirectoryUsersAsync(rows, ct));
    }

    /// <summary>Managers rattachés au département (hiérarchie métier + même triplet org).</summary>
    [HttpGet("users/managers")]
    public async Task<ActionResult<IReadOnlyList<DirectoryUserResponse>>> GetManagersByDepartement(
        [FromQuery] Guid departementId,
        CancellationToken ct)
    {
        var rows = await db.DirectoryUsers.AsNoTracking()
            .Where(u => u.Role == AppRole.Manager && u.DepartementId == departementId)
            .OrderBy(u => u.Nom)
            .ThenBy(u => u.Prenom)
            .ToListAsync(ct);
        return Ok(await MapDirectoryUsersAsync(rows, ct));
    }

    /// <summary>Coachs sous un manager (optionnellement filtrés par département).</summary>
    [HttpGet("users/coaches")]
    public async Task<ActionResult<IReadOnlyList<DirectoryUserResponse>>> GetCoachsByManager(
        [FromQuery] Guid managerId,
        [FromQuery] Guid? departementId,
        CancellationToken ct)
    {
        var q = db.DirectoryUsers.AsNoTracking()
            .Where(u => u.Role == AppRole.Coach && u.ManagerId == managerId);
        if (departementId.HasValue)
            q = q.Where(u => u.DepartementId == departementId.Value);
        var rows = await q.OrderBy(u => u.Nom).ThenBy(u => u.Prenom).ToListAsync(ct);
        return Ok(await MapDirectoryUsersAsync(rows, ct));
    }

    /// <summary>Pilotes rattachés à un coach (optionnellement filtrés par département).</summary>
    [HttpGet("users/pilotes")]
    public async Task<ActionResult<IReadOnlyList<DirectoryUserResponse>>> GetPilotesByCoach(
        [FromQuery] Guid coachId,
        [FromQuery] Guid? departementId,
        CancellationToken ct)
    {
        var q = db.DirectoryUsers.AsNoTracking()
            .Where(u => u.Role == AppRole.Pilote && u.CoachId == coachId);
        if (departementId.HasValue)
            q = q.Where(u => u.DepartementId == departementId.Value);
        var rows = await q.OrderBy(u => u.Nom).ThenBy(u => u.Prenom).ToListAsync(ct);
        return Ok(await MapDirectoryUsersAsync(rows, ct));
    }

    private async Task<IReadOnlyList<DirectoryUserResponse>> MapDirectoryUsersAsync(IReadOnlyList<DirectoryUser> rows, CancellationToken ct)
    {
        var ids = rows.SelectMany(u => new[] { u.PoleId, u.CelluleId, u.DepartementId }).Distinct().ToArray();
        var units = await LoadOrgUnitsByIdsAsync(ids, ct);
        return rows.Select(u => DirectoryUserMapper.ToResponse(
            u,
            units.GetValueOrDefault(u.PoleId),
            units.GetValueOrDefault(u.CelluleId),
            units.GetValueOrDefault(u.DepartementId))).ToList();
    }

    private async Task<DirectoryUserResponse> MapDirectoryUserAsync(DirectoryUser row, CancellationToken ct)
    {
        var ids = new[] { row.PoleId, row.CelluleId, row.DepartementId };
        var units = await LoadOrgUnitsByIdsAsync(ids, ct);
        return DirectoryUserMapper.ToResponse(
            row,
            units.GetValueOrDefault(row.PoleId),
            units.GetValueOrDefault(row.CelluleId),
            units.GetValueOrDefault(row.DepartementId));
    }

    private async Task<Dictionary<Guid, OrganisationUnit>> LoadOrgUnitsByIdsAsync(Guid[] ids, CancellationToken ct)
    {
        if (ids.Length == 0)
            return new Dictionary<Guid, OrganisationUnit>();
        return await db.OrganisationUnits.AsNoTracking()
            .Where(x => ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, ct);
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
