using DocumentationBackend.Api;
using DocumentationBackend.Context;
using DocumentationBackend.Data;
using DocumentationBackend.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace DocumentationBackend.Services;

public class DocumentationWorkflowService(
    DocumentationDbContext db,
    DocumentationUserContext userContext,
    IDocumentationTenantAccessor tenantAccessor,
    DocumentationCorrelationContext correlationContext,
    ILogger<DocumentationWorkflowService> logger)
{
    public async Task<(DocumentRequestResponse? response, int statusCode, string? error)> ValidateAsync(
        Guid documentRequestId,
        string? comment,
        CancellationToken ct)
    {
        var actorUserId = userContext.UserId!.Value;
        var role = userContext.Role!.Value;

        if (WorkflowBusinessRules.EnsureCanValidate(role) is { } denyValidate)
            return FromFailure(denyValidate, "Validate", documentRequestId, actorUserId, role);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var (entity, errMsg) = await TryLoadRequestAsync(documentRequestId, ct);
            if (entity is null)
            {
                await tx.RollbackAsync(ct);
                LogWorkflowDenied("Validate", documentRequestId, actorUserId, role, errMsg ?? "Demande introuvable.");
                return (null, StatusCodes.Status404NotFound, errMsg ?? "Demande introuvable.");
            }

            if (WorkflowBusinessRules.EnsurePending(entity.Status, "validate") is { } denyState)
            {
                await tx.RollbackAsync(ct);
                return FromFailure(denyState, "Validate", documentRequestId, actorUserId, role);
            }

            AppendAudit(actorUserId, "WORKFLOW_VALIDATE", documentRequestId, comment, true, null, entity.RequestNumber);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }

        var refreshed = await LoadRequestRowAsync(documentRequestId, ct);
        LogWorkflowCompleted("Validate", documentRequestId, actorUserId, role);
        var names = await DocumentRequestMappingHelper.LoadDisplayNamesAsync(
            db,
            new[] { refreshed.RequesterUserId, refreshed.BeneficiaryUserId ?? Guid.Empty },
            ct);
        return (DocumentRequestMapper.ToResponse(refreshed, refreshed.DocumentType, userContext, names), StatusCodes.Status200OK, null);
    }

    public async Task<(DocumentRequestResponse? response, int statusCode, string? error)> ApproveAsync(
        Guid documentRequestId,
        CancellationToken ct)
    {
        var actorUserId = userContext.UserId!.Value;
        var role = userContext.Role!.Value;

        if (WorkflowBusinessRules.EnsureCanApproveOrReject(role) is { } denyRole)
            return FromFailure(denyRole, "Approve", documentRequestId, actorUserId, role);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var (entity, errMsg) = await TryLoadRequestAsync(documentRequestId, ct);
            if (entity is null)
            {
                await tx.RollbackAsync(ct);
                LogWorkflowDenied("Approve", documentRequestId, actorUserId, role, errMsg ?? "Demande introuvable.");
                return (null, StatusCodes.Status404NotFound, errMsg ?? "Demande introuvable.");
            }

            if (WorkflowBusinessRules.EnsurePending(entity.Status, "approve") is { } denyState)
            {
                await tx.RollbackAsync(ct);
                return FromFailure(denyState, "Approve", documentRequestId, actorUserId, role);
            }

            var now = DateTimeOffset.UtcNow;
            entity.Status = DocumentRequestStatus.Approved;
            entity.DecidedByUserId = actorUserId;
            entity.DecidedAt = now;
            entity.UpdatedAt = now;

            AppendAudit(actorUserId, "WORKFLOW_APPROVE", documentRequestId, null, true, null, entity.RequestNumber);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }

        var refreshed = await LoadRequestRowAsync(documentRequestId, ct);
        LogWorkflowCompleted("Approve", documentRequestId, actorUserId, role);
        var namesA = await DocumentRequestMappingHelper.LoadDisplayNamesAsync(
            db,
            new[] { refreshed.RequesterUserId, refreshed.BeneficiaryUserId ?? Guid.Empty },
            ct);
        return (DocumentRequestMapper.ToResponse(refreshed, refreshed.DocumentType, userContext, namesA), StatusCodes.Status200OK, null);
    }

    public async Task<(DocumentRequestResponse? response, int statusCode, string? error)> RejectAsync(
        Guid documentRequestId,
        string rejectionReason,
        CancellationToken ct)
    {
        if (WorkflowBusinessRules.EnsureRejectReason(rejectionReason) is { } denyReason)
            return (null, denyReason.StatusCode, denyReason.Message);

        var actorUserId = userContext.UserId!.Value;
        var role = userContext.Role!.Value;

        if (WorkflowBusinessRules.EnsureCanApproveOrReject(role) is { } denyRole)
            return FromFailure(denyRole, "Reject", documentRequestId, actorUserId, role);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var (entity, errMsg) = await TryLoadRequestAsync(documentRequestId, ct);
            if (entity is null)
            {
                await tx.RollbackAsync(ct);
                LogWorkflowDenied("Reject", documentRequestId, actorUserId, role, errMsg ?? "Demande introuvable.");
                return (null, StatusCodes.Status404NotFound, errMsg ?? "Demande introuvable.");
            }

            if (WorkflowBusinessRules.EnsurePending(entity.Status, "reject") is { } denyState)
            {
                await tx.RollbackAsync(ct);
                return FromFailure(denyState, "Reject", documentRequestId, actorUserId, role);
            }

            var now = DateTimeOffset.UtcNow;
            var trimmed = rejectionReason.Trim();
            entity.Status = DocumentRequestStatus.Rejected;
            entity.DecidedByUserId = actorUserId;
            entity.DecidedAt = now;
            entity.RejectionReason = trimmed;
            entity.UpdatedAt = now;

            AppendAudit(actorUserId, "WORKFLOW_REJECT", documentRequestId, trimmed, true, null, entity.RequestNumber);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }

        var refreshed = await LoadRequestRowAsync(documentRequestId, ct);
        LogWorkflowCompleted("Reject", documentRequestId, actorUserId, role, rejectionReason.Trim());
        var namesR = await DocumentRequestMappingHelper.LoadDisplayNamesAsync(
            db,
            new[] { refreshed.RequesterUserId, refreshed.BeneficiaryUserId ?? Guid.Empty },
            ct);
        return (DocumentRequestMapper.ToResponse(refreshed, refreshed.DocumentType, userContext, namesR), StatusCodes.Status200OK, null);
    }

    private (DocumentRequestResponse? response, int statusCode, string? error) FromFailure(
        WorkflowFailure fail,
        string action,
        Guid documentRequestId,
        Guid userId,
        AppRole role)
    {
        LogWorkflowDenied(action, documentRequestId, userId, role, fail.Message);
        return (null, fail.StatusCode, fail.Message);
    }

    private async Task<(DocumentRequest? Entity, string? Error)> TryLoadRequestAsync(Guid id, CancellationToken ct)
    {
        var entity = await db.DocumentRequests
            .Include(r => r.DocumentType)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
        if (entity is not null)
            return (entity, null);
        return (null, "Demande introuvable.");
    }

    private void LogWorkflowCompleted(string action, Guid documentRequestId, Guid userId, AppRole role, string? extra = null) =>
        logger.LogInformation(
            "Documentation workflow {WorkflowAction} succeeded for {DocumentRequestId} UserId={UserId} Role={Role} TenantId={TenantId} CorrelationId={CorrelationId} Extra={Extra}",
            action,
            documentRequestId,
            userId,
            role,
            tenantAccessor.ResolvedTenantId,
            correlationContext.CorrelationId,
            extra ?? "");

    private void LogWorkflowDenied(string action, Guid documentRequestId, Guid userId, AppRole role, string reason) =>
        logger.LogWarning(
            "Documentation workflow {WorkflowAction} denied for {DocumentRequestId} UserId={UserId} Role={Role} TenantId={TenantId} CorrelationId={CorrelationId} Reason={Reason}",
            action,
            documentRequestId,
            userId,
            role,
            tenantAccessor.ResolvedTenantId,
            correlationContext.CorrelationId,
            reason);

    private async Task<DocumentRequest> LoadRequestRowAsync(Guid id, CancellationToken ct) =>
        await db.DocumentRequests
            .AsNoTracking()
            .Include(r => r.DocumentType)
            .FirstAsync(r => r.Id == id, ct);

    private void AppendAudit(
        Guid? actorUserId,
        string action,
        Guid entityId,
        string? details,
        bool success,
        string? errorMessage,
        string? requestNumber)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantAccessor.ResolvedTenantId,
            OccurredAt = DateTimeOffset.UtcNow,
            ActorUserId = actorUserId,
            Action = action,
            EntityType = "document_request",
            EntityId = entityId,
            CorrelationId = correlationContext.CorrelationId,
            Details = details,
            Success = success,
            ErrorMessage = errorMessage,
            RequestNumber = requestNumber,
        });
    }
}
