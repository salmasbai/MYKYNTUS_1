using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace DocumentationBackend.Context;

/// <summary>
/// Remplit <see cref="DocumentationUserContext"/> pour chaque requête et impose un contexte valide sur <c>/api/documentation/data</c>.
/// </summary>
public sealed class DocumentationUserContextMiddleware(RequestDelegate next)
{
    private static readonly JsonSerializerOptions Json = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task InvokeAsync(HttpContext httpContext, DocumentationUserContext userContext, IHostEnvironment hostEnvironment)
    {
        userContext.LoadFromHeaders(httpContext.Request.Headers, hostEnvironment);

        if (HttpMethods.IsOptions(httpContext.Request.Method))
        {
            await next(httpContext);
            return;
        }

        var path = httpContext.Request.Path.Value ?? "";
        if (DocumentationTechnicalPaths.BypassesUserContext(path))
        {
            await next(httpContext);
            return;
        }

        if (!path.StartsWith("/api/documentation/data", StringComparison.OrdinalIgnoreCase))
        {
            await next(httpContext);
            return;
        }

        if (!string.IsNullOrEmpty(userContext.ValidationError))
        {
            httpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            httpContext.Response.ContentType = "application/json";
            await httpContext.Response.WriteAsync(JsonSerializer.Serialize(new { message = userContext.ValidationError }, Json));
            return;
        }

        if (!userContext.IsComplete)
        {
            httpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            httpContext.Response.ContentType = "application/json";
            await httpContext.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message =
                    "Contexte utilisateur incomplet ou absent. Fournir au minimum les en-têtes " +
                    $"{DocumentationInboundHeaders.UserId} et {DocumentationInboundHeaders.UserRole} " +
                    $"(ou {DocumentationInboundHeaders.LegacyUserId} / {DocumentationInboundHeaders.LegacyUserRole}). " +
                    (hostEnvironment.IsDevelopment()
                        ? "En développement uniquement, un rôle peut être déduit pour les identités du jeu de démo."
                        : "Le rôle doit être fourni explicitement par la gateway."),
                code = "documentation_context_missing",
            }, Json));
            return;
        }

        await next(httpContext);
    }
}
