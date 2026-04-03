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

        if (!WorkflowActionPolicy.CanValidate(role))
        {
            LogWorkflowDenied("Validate", documentRequestId, actorUserId, role, "Rôle non autorisé pour la validation.");
            return (null, StatusCodes.Status403Forbidden, "Rôle non autorisé pour la validation.");
        }

        var (entity, errMsg) = await TryLoadRequestAsync(documentRequestId, ct);
        if (entity is null)
        {
            LogWorkflowDenied("Validate", documentRequestId, actorUserId, role, errMsg ?? "Demande introuvable.");
            return (null, StatusCodes.Status404NotFound, errMsg ?? "Demande introuvable.");
        }

        if (entity.Status != DocumentRequestStatus.Pending)
        {
            LogWorkflowDenied("Validate", documentRequestId, actorUserId, role, "La demande n'est plus en attente.");
            return (null, StatusCodes.Status409Conflict, "La demande n'est plus en attente.");
        }

        AppendAudit(actorUserId, "WORKFLOW_VALIDATE", documentRequestId, comment, true, null);
        await db.SaveChangesAsync(ct);

        var refreshed = await LoadRequestRowAsync(documentRequestId, ct);
        LogWorkflowCompleted("Validate", documentRequestId, actorUserId, role);
        return (DocumentRequestMapper.ToResponse(refreshed, refreshed.DocumentType, userContext), StatusCodes.Status200OK, null);
    }

    public async Task<(DocumentRequestResponse? response, int statusCode, string? error)> ApproveAsync(
        Guid documentRequestId,
        CancellationToken ct)
    {
        var actorUserId = userContext.UserId!.Value;
        var role = userContext.Role!.Value;

        if (!WorkflowActionPolicy.CanApproveOrReject(role))
        {
            LogWorkflowDenied("Approve", documentRequestId, actorUserId, role, "Seule la RH peut approuver.");
            return (null, StatusCodes.Status403Forbidden, "Seule la RH peut approuver.");
        }

        var (entity, errMsg) = await TryLoadRequestAsync(documentRequestId, ct);
        if (entity is null)
        {
            LogWorkflowDenied("Approve", documentRequestId, actorUserId, role, errMsg ?? "Demande introuvable.");
            return (null, StatusCodes.Status404NotFound, errMsg ?? "Demande introuvable.");
        }

        if (entity.Status != DocumentRequestStatus.Pending)
        {
            LogWorkflowDenied("Approve", documentRequestId, actorUserId, role, "La demande n'est plus en attente.");
            return (null, StatusCodes.Status409Conflict, "La demande n'est plus en attente.");
        }

        var now = DateTimeOffset.UtcNow;
        entity.Status = DocumentRequestStatus.Approved;
        entity.DecidedByUserId = actorUserId;
        entity.DecidedAt = now;
        entity.UpdatedAt = now;

        AppendAudit(actorUserId, "WORKFLOW_APPROVE", documentRequestId, null, true, null);
        await db.SaveChangesAsync(ct);

        var refreshed = await LoadRequestRowAsync(documentRequestId, ct);
        LogWorkflowCompleted("Approve", documentRequestId, actorUserId, role);
        return (DocumentRequestMapper.ToResponse(refreshed, refreshed.DocumentType, userContext), StatusCodes.Status200OK, null);
    }

    public async Task<(DocumentRequestResponse? response, int statusCode, string? error)> RejectAsync(
        Guid documentRequestId,
        string rejectionReason,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(rejectionReason))
            return (null, StatusCodes.Status400BadRequest, "rejectionReason obligatoire.");

        var actorUserId = userContext.UserId!.Value;
        var role = userContext.Role!.Value;

        if (!WorkflowActionPolicy.CanApproveOrReject(role))
        {
            LogWorkflowDenied("Reject", documentRequestId, actorUserId, role, "Seule la RH peut rejeter.");
            return (null, StatusCodes.Status403Forbidden, "Seule la RH peut rejeter.");
        }

        var (entity, errMsg) = await TryLoadRequestAsync(documentRequestId, ct);
        if (entity is null)
        {
            LogWorkflowDenied("Reject", documentRequestId, actorUserId, role, errMsg ?? "Demande introuvable.");
            return (null, StatusCodes.Status404NotFound, errMsg ?? "Demande introuvable.");
        }

        if (entity.Status != DocumentRequestStatus.Pending)
        {
            LogWorkflowDenied("Reject", documentRequestId, actorUserId, role, "La demande n'est plus en attente.");
            return (null, StatusCodes.Status409Conflict, "La demande n'est plus en attente.");
        }

        var now = DateTimeOffset.UtcNow;
        entity.Status = DocumentRequestStatus.Rejected;
        entity.DecidedByUserId = actorUserId;
        entity.DecidedAt = now;
        entity.RejectionReason = rejectionReason.Trim();
        entity.UpdatedAt = now;

        AppendAudit(actorUserId, "WORKFLOW_REJECT", documentRequestId, rejectionReason.Trim(), true, null);
        await db.SaveChangesAsync(ct);

        var refreshed = await LoadRequestRowAsync(documentRequestId, ct);
        LogWorkflowCompleted("Reject", documentRequestId, actorUserId, role, rejectionReason.Trim());
        return (DocumentRequestMapper.ToResponse(refreshed, refreshed.DocumentType, userContext), StatusCodes.Status200OK, null);
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
            userContext.TenantId ?? "",
            correlationContext.CorrelationId,
            extra ?? "");

    private void LogWorkflowDenied(string action, Guid documentRequestId, Guid userId, AppRole role, string reason) =>
        logger.LogWarning(
            "Documentation workflow {WorkflowAction} denied for {DocumentRequestId} UserId={UserId} Role={Role} TenantId={TenantId} CorrelationId={CorrelationId} Reason={Reason}",
            action,
            documentRequestId,
            userId,
            role,
            userContext.TenantId ?? "",
            correlationContext.CorrelationId,
            reason);

    private async Task<DocumentRequest> LoadRequestRowAsync(Guid id, CancellationToken ct) =>
        await db.DocumentRequests
            .AsNoTracking()
            .Include(r => r.DocumentType)
            .FirstAsync(r => r.Id == id, ct);

    private void AppendAudit(Guid? actorUserId, string action, Guid entityId, string? details, bool success, string? errorMessage)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            OccurredAt = DateTimeOffset.UtcNow,
            ActorUserId = actorUserId,
            Action = action,
            EntityType = "document_request",
            EntityId = entityId,
            CorrelationId = correlationContext.CorrelationId,
            Details = details,
            Success = success,
            ErrorMessage = errorMessage,
        });
    }
}
