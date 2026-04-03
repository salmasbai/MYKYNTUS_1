namespace DocumentationBackend.Context;

/// <summary>Chemins exemptés de l’obligation de contexte utilisateur (probes, statut technique).</summary>
internal static class DocumentationTechnicalPaths
{
    internal static bool BypassesUserContext(string? path)
    {
        if (string.IsNullOrEmpty(path))
            return false;

        var p = path.TrimEnd('/');
        if (p.Length == 0)
            p = "/";

        return p.Equals("/health", StringComparison.OrdinalIgnoreCase)
            || IsKnownSegment(p)
            || p.StartsWith("/api/documentation/db/", StringComparison.OrdinalIgnoreCase)
            || p.StartsWith("/api/documentation/health", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsKnownSegment(string p) =>
        p.Equals("/healthz", StringComparison.OrdinalIgnoreCase)
        || p.Equals("/ready", StringComparison.OrdinalIgnoreCase)
        || p.Equals("/alive", StringComparison.OrdinalIgnoreCase);
}
