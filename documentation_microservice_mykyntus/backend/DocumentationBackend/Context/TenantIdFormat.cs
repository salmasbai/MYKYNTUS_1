namespace DocumentationBackend.Context;

/// <summary>Validation stricte du tenant (slug opaque, sans caractères de contrôle).</summary>
internal static class TenantIdFormat
{
    internal const int MaxLength = 64;

    internal static bool IsValid(string? tenantId)
    {
        if (string.IsNullOrEmpty(tenantId) || tenantId.Length > MaxLength)
            return false;

        foreach (var c in tenantId)
        {
            if (char.IsAsciiLetterOrDigit(c) || c is '.' or '_' or '-')
                continue;
            return false;
        }

        return true;
    }
}
