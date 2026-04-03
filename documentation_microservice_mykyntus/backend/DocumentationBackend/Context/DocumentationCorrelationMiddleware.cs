using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace DocumentationBackend.Context;

/// <summary>Propage <see cref="DocumentationInboundHeaders.CorrelationId"/> (ou en génère un) sur la réponse et le contexte.</summary>
public sealed class DocumentationCorrelationMiddleware(RequestDelegate next)
{
    public const string CorrelationIdItemKey = "DocumentationCorrelationId";

    public async Task InvokeAsync(
        HttpContext httpContext,
        DocumentationCorrelationContext correlation,
        ILogger<DocumentationCorrelationMiddleware> logger)
    {
        Guid correlationId;
        if (httpContext.Request.Headers.TryGetValue(DocumentationInboundHeaders.CorrelationId, out var raw)
            && !string.IsNullOrWhiteSpace(raw)
            && Guid.TryParse(raw.ToString(), out var parsed))
        {
            correlationId = parsed;
        }
        else
        {
            correlationId = Guid.NewGuid();
        }

        correlation.CorrelationId = correlationId;
        httpContext.Items[CorrelationIdItemKey] = correlationId;
        httpContext.Response.Headers[DocumentationInboundHeaders.CorrelationId] = correlationId.ToString();

        using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = correlationId.ToString("D") }))
        {
            await next(httpContext);
        }
    }
}
