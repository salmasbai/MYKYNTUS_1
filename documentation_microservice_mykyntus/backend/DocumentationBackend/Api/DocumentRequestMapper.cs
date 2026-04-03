using DocumentationBackend.Context;
using DocumentationBackend.Data;
using DocumentationBackend.Data.Entities;

namespace DocumentationBackend.Api;

internal static class DocumentRequestMapper
{
    internal static DocumentRequestResponse ToResponse(
        DocumentRequest r,
        DocumentType? documentType,
        DocumentationUserContext userContext)
    {
        var typeLabel = r.IsCustomType
            ? (r.CustomTypeDescription ?? "Autre")
            : (documentType?.Name ?? "—");
        var displayId = !string.IsNullOrEmpty(r.RequestNumber) ? r.RequestNumber! : r.Id.ToString();
        var employeeName = r.BeneficiaryUserId.HasValue
            ? $"{DemoActors.ResolveDisplayName(r.RequesterUserId)} → {DemoActors.ResolveDisplayName(r.BeneficiaryUserId.Value)}"
            : DemoActors.ResolveDisplayName(r.RequesterUserId);

        IReadOnlyList<string> allowed = Array.Empty<string>();
        if (userContext.IsComplete)
            allowed = WorkflowActionPolicy.AllowedActionsForActor(userContext.Role!.Value, r.Status);

        return new DocumentRequestResponse(
            displayId,
            r.Id.ToString(),
            typeLabel,
            r.CreatedAt.ToString("yyyy-MM-dd"),
            r.Status.ToString(),
            employeeName,
            r.RequesterUserId.ToString(),
            r.Reason,
            r.IsCustomType,
            allowed,
            r.RejectionReason,
            r.DecidedAt?.ToString("O"));
    }
}
