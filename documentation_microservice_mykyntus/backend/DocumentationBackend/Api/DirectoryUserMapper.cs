using DocumentationBackend.Data;
using DocumentationBackend.Data.Entities;

namespace DocumentationBackend.Api;

internal static class DirectoryUserMapper
{
    internal static DirectoryUserResponse ToResponse(DirectoryUser u) =>
        new(u.Id.ToString(), u.Prenom, u.Nom, u.Email, AppRoleToApi(u.Role));

    private static string AppRoleToApi(AppRole r) =>
        r switch
        {
            AppRole.Pilote => "pilote",
            AppRole.Coach => "coach",
            AppRole.Manager => "manager",
            AppRole.Rp => "rp",
            AppRole.Rh => "rh",
            AppRole.Admin => "admin",
            AppRole.Audit => "audit",
            _ => throw new ArgumentOutOfRangeException(nameof(r), r, null),
        };
}
