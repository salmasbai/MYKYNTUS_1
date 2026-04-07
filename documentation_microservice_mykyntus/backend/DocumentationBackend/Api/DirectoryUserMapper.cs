using DocumentationBackend.Data;
using DocumentationBackend.Data.Entities;

namespace DocumentationBackend.Api;

internal static class DirectoryUserMapper
{
    internal static DirectoryUserResponse ToResponse(
        DirectoryUser u,
        OrganisationUnit? pole,
        OrganisationUnit? cellule,
        OrganisationUnit? departement) =>
        new(
            u.Id.ToString(),
            u.Prenom,
            u.Nom,
            u.Email,
            AppRoleToApi(u.Role),
            u.ManagerId.HasValue ? u.ManagerId.Value.ToString() : null,
            u.CoachId.HasValue ? u.CoachId.Value.ToString() : null,
            u.RpId.HasValue ? u.RpId.Value.ToString() : null,
            u.PoleId.ToString(),
            u.CelluleId.ToString(),
            u.DepartementId.ToString(),
            ToSummary(pole),
            ToSummary(cellule),
            ToSummary(departement));

    private static OrganizationalUnitSummary? ToSummary(OrganisationUnit? u) =>
        u is null ? null : new OrganizationalUnitSummary(u.Id.ToString(), u.Code, u.Name, u.UnitType);

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
