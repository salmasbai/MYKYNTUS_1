using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DocumentationBackend.Context;

/// <summary>
/// Résout le tenant pour les filtres EF (<see cref="Data.DocumentationDbContext"/>) et les écritures.
/// Chaîne de repli : en-tête <c>X-Tenant-Id</c> → <c>Documentation:DefaultTenantId</c> → <c>atlas-tech-demo</c>.
/// <see cref="ResolvedTenantId"/> est toujours une chaîne non vide.
/// </summary>
public sealed class DocumentationTenantAccessor : IDocumentationTenantAccessor
{
    private const string FallbackTenant = "atlas-tech-demo";

    private readonly DocumentationUserContext _userContext;
    private readonly string _defaultTenantFromConfig;
    private readonly ILogger<DocumentationTenantAccessor> _logger;

    public DocumentationTenantAccessor(
        DocumentationUserContext userContext,
        IConfiguration configuration,
        ILogger<DocumentationTenantAccessor> logger)
    {
        _userContext = userContext;
        _logger = logger;
        _defaultTenantFromConfig = configuration["Documentation:DefaultTenantId"]?.Trim() ?? "";
    }

    public string ResolvedTenantId
    {
        get
        {
            var fromHeader = _userContext.TenantId;
            if (!string.IsNullOrWhiteSpace(fromHeader))
            {
                var resolved = fromHeader.Trim();
                _logger.LogInformation("Tenant resolved: {TenantId}", resolved);
                return resolved;
            }

            if (!string.IsNullOrWhiteSpace(_defaultTenantFromConfig))
            {
                _logger.LogInformation("Tenant resolved: {TenantId}", _defaultTenantFromConfig);
                return _defaultTenantFromConfig;
            }

            _logger.LogInformation("Tenant resolved: {TenantId}", FallbackTenant);
            return FallbackTenant;
        }
    }
}
