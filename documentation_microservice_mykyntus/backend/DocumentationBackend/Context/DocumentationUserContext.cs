using DocumentationBackend.Api;
using DocumentationBackend.Data;
using Microsoft.Extensions.Primitives;

namespace DocumentationBackend.Context;

/// <summary>
/// Contexte utilisateur par requête, alimenté par la gateway / SSO via en-têtes (sans JWT dans ce microservice).
/// </summary>
public sealed class DocumentationUserContext
{
    public Guid? UserId { get; private set; }
    public AppRole? Role { get; private set; }

    /// <summary>Identifiant tenant (traçabilité / gateway) — non requis pour les requêtes métier si la base est au schéma 001.</summary>
    public string? TenantId { get; private set; }

    public bool IsComplete => UserId.HasValue && Role.HasValue;

    public string? ValidationError { get; private set; }

    public void LoadFromHeaders(IHeaderDictionary headers, IHostEnvironment environment)
    {
        UserId = null;
        Role = null;
        TenantId = null;
        ValidationError = null;

        var idRaw = FirstHeader(headers, DocumentationInboundHeaders.UserId, DocumentationInboundHeaders.LegacyUserId);
        if (!string.IsNullOrWhiteSpace(idRaw))
        {
            if (!Guid.TryParse(idRaw.Trim(), out var uid) || uid == Guid.Empty)
            {
                ValidationError = "L'en-tête d'identifiant utilisateur doit être un UUID valide.";
                return;
            }

            UserId = uid;
        }

        var roleRaw = FirstHeader(headers, DocumentationInboundHeaders.UserRole, DocumentationInboundHeaders.LegacyUserRole);
        if (!string.IsNullOrWhiteSpace(roleRaw))
        {
            if (!AppRoleHeaderParser.TryParse(roleRaw, out var roleFromHeader))
            {
                ValidationError =
                    "L'en-tête de rôle doit correspondre à une valeur d'énumération : pilote, coach, manager, rp, rh, admin, audit.";
                return;
            }

            Role = roleFromHeader;
        }
        else if (UserId.HasValue && environment.IsDevelopment() && DemoActors.TryGetRole(UserId.Value, out var roleFromDemo))
        {
            Role = roleFromDemo;
        }

        var tenantRaw = FirstHeader(headers, DocumentationInboundHeaders.TenantId, DocumentationInboundHeaders.LegacyTenantId);
        if (string.IsNullOrWhiteSpace(tenantRaw))
        {
            TenantId = null;
        }
        else
        {
            var normalized = tenantRaw.Trim();
            if (!TenantIdFormat.IsValid(normalized))
            {
                ValidationError =
                    "L'en-tête tenant doit être un identifiant court (lettres, chiffres, point, tiret, underscore ; max 64 caractères).";
                return;
            }

            TenantId = normalized;
        }
    }

    private static string? FirstHeader(IHeaderDictionary headers, params string[] names)
    {
        foreach (var name in names)
        {
            if (headers.TryGetValue(name, out var v) && !StringValues.IsNullOrEmpty(v))
                return v.ToString();
        }

        return null;
    }
}
