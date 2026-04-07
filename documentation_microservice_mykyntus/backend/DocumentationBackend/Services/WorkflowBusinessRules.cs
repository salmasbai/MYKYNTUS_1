using DocumentationBackend.Api;
using DocumentationBackend.Data;
using Microsoft.AspNetCore.Http;

namespace DocumentationBackend.Services;

/// <summary>Règles métier pures du workflow — testables sans base.</summary>
internal static class WorkflowBusinessRules
{
    internal static WorkflowFailure? EnsureCanValidate(AppRole role) =>
        WorkflowActionPolicy.CanValidate(role)
            ? null
            : new WorkflowFailure(
                StatusCodes.Status403Forbidden,
                "ROLE_DENIED",
                "Rôle non autorisé pour la validation.");

    internal static WorkflowFailure? EnsureCanApproveOrReject(AppRole role) =>
        WorkflowActionPolicy.CanApproveOrReject(role)
            ? null
            : new WorkflowFailure(
                StatusCodes.Status403Forbidden,
                "ROLE_DENIED",
                "Seule la RH peut approuver ou rejeter.");

    internal static WorkflowFailure? EnsurePending(DocumentRequestStatus status, string attemptedAction) =>
        status == DocumentRequestStatus.Pending
            ? null
            : new WorkflowFailure(
                StatusCodes.Status409Conflict,
                "INVALID_STATE",
                $"La demande n'est plus en attente (action: {attemptedAction}).");

    internal static WorkflowFailure? EnsureRejectReason(string? rejectionReason)
    {
        if (string.IsNullOrWhiteSpace(rejectionReason))
            return new WorkflowFailure(StatusCodes.Status400BadRequest, "MISSING_REASON", "rejectionReason obligatoire.");
        return null;
    }
}
