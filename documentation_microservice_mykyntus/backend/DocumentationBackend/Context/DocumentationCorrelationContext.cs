namespace DocumentationBackend.Context;

/// <summary>Identifiant de corrélation par requête (logs structurés + audit).</summary>
public sealed class DocumentationCorrelationContext
{
    public Guid CorrelationId { get; internal set; }
}
