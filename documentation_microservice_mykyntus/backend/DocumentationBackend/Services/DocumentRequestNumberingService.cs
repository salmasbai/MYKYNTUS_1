using System.Data;
using DocumentationBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;

namespace DocumentationBackend.Services;

/// <summary>
/// Numérotation REQ transactionnelle : la fonction SQL applique déjà <c>pg_advisory_xact_lock</c> (script 004).
/// </summary>
public static class DocumentRequestNumberingService
{
    public static async Task<string> AllocateNextAsync(DocumentationDbContext db, string tenantId, CancellationToken ct)
    {
        var connection = (NpgsqlConnection)db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(ct);

        var npgsqlTx = (db.Database.CurrentTransaction as RelationalTransaction)?.GetDbTransaction() as NpgsqlTransaction;
        await using var cmd = new NpgsqlCommand(
            "SELECT documentation.next_document_request_number(@p_tenant)",
            connection,
            npgsqlTx);

        cmd.Parameters.AddWithValue("p_tenant", tenantId);

        var result = await cmd.ExecuteScalarAsync(ct);
        if (result is not string s || string.IsNullOrWhiteSpace(s))
            throw new InvalidOperationException("next_document_request_number a renvoyé une valeur vide.");
        return s;
    }
}
