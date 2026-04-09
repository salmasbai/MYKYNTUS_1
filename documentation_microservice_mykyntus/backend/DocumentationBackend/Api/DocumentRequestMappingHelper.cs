using DocumentationBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace DocumentationBackend.Api;

internal static class DocumentRequestMappingHelper
{
    internal static async Task<IReadOnlyDictionary<Guid, string>> LoadDisplayNamesAsync(
        DocumentationDbContext db,
        IEnumerable<Guid> ids,
        CancellationToken ct)
    {
        var set = ids.Where(g => g != Guid.Empty).Distinct().ToList();
        if (set.Count == 0)
            return new Dictionary<Guid, string>();

        var rows = await db.DirectoryUsers.AsNoTracking()
            .Where(u => set.Contains(u.Id))
            .Select(u => new { u.Id, u.Prenom, u.Nom })
            .ToListAsync(ct);

        return rows.ToDictionary(r => r.Id, r => $"{r.Prenom} {r.Nom}".Trim());
    }

    internal static string ResolveName(IReadOnlyDictionary<Guid, string> names, Guid id) =>
        names.TryGetValue(id, out var n) ? n : $"Utilisateur {id}";
}
