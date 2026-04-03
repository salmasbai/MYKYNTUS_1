using DocumentationBackend.Data;

namespace DocumentationBackend.Api;

/// <summary>Parse la valeur de l’en-tête <c>X-Documentation-User-Role</c> (libellés alignés sur l’enum PostgreSQL <c>app_role</c>).</summary>
internal static class AppRoleHeaderParser
{
    internal static bool TryParse(string? value, out AppRole role)
    {
        role = default;
        if (string.IsNullOrWhiteSpace(value))
            return false;

        switch (value.Trim().ToLowerInvariant())
        {
            case "pilote":
                role = AppRole.Pilote;
                return true;
            case "coach":
                role = AppRole.Coach;
                return true;
            case "manager":
                role = AppRole.Manager;
                return true;
            case "rp":
                role = AppRole.Rp;
                return true;
            case "rh":
                role = AppRole.Rh;
                return true;
            case "admin":
                role = AppRole.Admin;
                return true;
            case "audit":
                role = AppRole.Audit;
                return true;
            default:
                return false;
        }
    }
}
