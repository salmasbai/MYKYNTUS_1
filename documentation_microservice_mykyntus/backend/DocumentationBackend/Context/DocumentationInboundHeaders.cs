namespace DocumentationBackend.Context;

/// <summary>
/// Contrat d’injection par la gateway : en-têtes standard + variantes <c>X-Documentation-*</c> (rétrocompat).
/// </summary>
public static class DocumentationInboundHeaders
{
    /// <summary>Identifiant utilisateur (UUID).</summary>
    public const string UserId = "X-User-Id";
    public const string UserRole = "X-User-Role";
    /// <summary>Identifiant locataire / tenant (opaque : UUID, slug, etc.).</summary>
    public const string TenantId = "X-Tenant-Id";

    public const string LegacyUserId = "X-Documentation-User-Id";
    public const string LegacyUserRole = "X-Documentation-User-Role";
    public const string LegacyTenantId = "X-Documentation-Tenant-Id";

    /// <summary>Corrélation requête / logs / audit (UUID recommandé).</summary>
    public const string CorrelationId = "X-Correlation-Id";

    /// <summary>Périmètre organisationnel (optionnel) — filtrage des données selon la hiérarchie.</summary>
    public const string ScopeManagerId = "X-Scope-Manager-Id";

    public const string ScopeCoachId = "X-Scope-Coach-Id";
}
