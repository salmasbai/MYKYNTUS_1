namespace DocumentationBackend.Context;

/// <summary>
/// Résout le tenant courant pour isolation EF et cohérence avec l’annuaire (défaut démo si absent).
/// </summary>
public interface IDocumentationTenantAccessor
{
    /// <summary>Identifiant tenant normalisé (jamais vide en pratique métier).</summary>
    string ResolvedTenantId { get; }
}
