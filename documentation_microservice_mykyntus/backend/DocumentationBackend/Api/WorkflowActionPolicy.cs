using DocumentationBackend.Data;

namespace DocumentationBackend.Api;

/// <summary>Actions d’workflow autorisées par rôle (état pending uniquement). Règles métier côté serveur.</summary>
internal static class WorkflowActionPolicy
{
    internal static IReadOnlyList<string> AllowedActionsForActor(AppRole role, DocumentRequestStatus status)
    {
        if (status != DocumentRequestStatus.Pending)
            return Array.Empty<string>();

        return role switch
        {
            AppRole.Rh or AppRole.Admin => new[] { "approve", "reject" },
            AppRole.Coach or AppRole.Manager or AppRole.Rp => new[] { "validate" },
            _ => Array.Empty<string>(),
        };
    }

    internal static bool CanValidate(AppRole role) =>
        role is AppRole.Coach or AppRole.Manager or AppRole.Rp;

    internal static bool CanApproveOrReject(AppRole role) => role is AppRole.Rh or AppRole.Admin;
}
