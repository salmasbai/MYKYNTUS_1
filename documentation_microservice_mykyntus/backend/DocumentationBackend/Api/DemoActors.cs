using System.Linq;
using DocumentationBackend.Data;

namespace DocumentationBackend.Api;

/// <summary>Annuaire démo aligné sur le seed SQL (identités SSO fictives).</summary>
internal static class DemoActors
{
    internal static readonly IReadOnlyDictionary<Guid, string> DisplayNames = new Dictionary<Guid, string>
    {
        [Guid.Parse("11111111-1111-4111-8111-111111111101")] = "Yasmine El Amrani",
        [Guid.Parse("11111111-1111-4111-8111-111111111102")] = "Omar Benali",
        [Guid.Parse("11111111-1111-4111-8111-111111111103")] = "Salma Idrissi",
        [Guid.Parse("11111111-1111-4111-8111-111111111104")] = "Ahmed Ouazzani",
        [Guid.Parse("55555555-5555-4555-8555-555555555501")] = "Mehdi Sefrioui (Coach)",
        [Guid.Parse("22222222-2222-4222-8222-222222222201")] = "Karim Tazi",
        [Guid.Parse("66666666-6666-4666-8666-666666666601")] = "Houda Mansouri",
        [Guid.Parse("33333333-3333-4333-8333-333333333301")] = "Fatima Alaoui (RH)",
        [Guid.Parse("77777777-7777-4777-8777-777777777701")] = "Youssef El Alamy (Admin SI)",
        [Guid.Parse("44444444-4444-4444-8444-444444444401")] = "Nadia Berrada (Audit)",
    };

    private static readonly IReadOnlyDictionary<Guid, AppRole> Roles = new Dictionary<Guid, AppRole>
    {
        [Guid.Parse("11111111-1111-4111-8111-111111111101")] = AppRole.Pilote,
        [Guid.Parse("11111111-1111-4111-8111-111111111102")] = AppRole.Pilote,
        [Guid.Parse("11111111-1111-4111-8111-111111111103")] = AppRole.Pilote,
        [Guid.Parse("11111111-1111-4111-8111-111111111104")] = AppRole.Pilote,
        [Guid.Parse("55555555-5555-4555-8555-555555555501")] = AppRole.Coach,
        [Guid.Parse("22222222-2222-4222-8222-222222222201")] = AppRole.Manager,
        [Guid.Parse("66666666-6666-4666-8666-666666666601")] = AppRole.Rp,
        [Guid.Parse("33333333-3333-4333-8333-333333333301")] = AppRole.Rh,
        [Guid.Parse("77777777-7777-4777-8777-777777777701")] = AppRole.Admin,
        [Guid.Parse("44444444-4444-4444-8444-444444444401")] = AppRole.Audit,
    };

    internal static string ResolveDisplayName(Guid userId) =>
        DisplayNames.TryGetValue(userId, out var name) ? name : userId.ToString();

    internal static bool TryGetRole(Guid userId, out AppRole role) => Roles.TryGetValue(userId, out role);

    internal static IReadOnlyList<Guid> GetUserIdsForRole(AppRole role) =>
        Roles.Where(kv => kv.Value == role).Select(kv => kv.Key).ToList();
}
