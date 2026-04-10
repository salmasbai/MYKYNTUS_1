namespace DocumentationBackend.Services;

public interface IPdfExportService
{
    (string FileName, string StorageUri, long FileSizeBytes) Export(string templateCode, string tenantId, string renderedContent);
}

public sealed class PdfExportService : IPdfExportService
{
    public (string FileName, string StorageUri, long FileSizeBytes) Export(string templateCode, string tenantId, string renderedContent)
    {
        var now = DateTimeOffset.UtcNow;
        var fileName = $"GEN_{templateCode}_{now:yyyyMMddHHmmss}.pdf";
        var storageUri = $"https://storage.local/mykyntus/generated/{tenantId}/{fileName}";
        var size = Math.Max(128, renderedContent.Length);
        return (fileName, storageUri, size);
    }
}
