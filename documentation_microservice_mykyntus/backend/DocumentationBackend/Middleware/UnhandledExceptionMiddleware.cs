using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using DocumentationBackend.Context;
using Microsoft.AspNetCore.Http;
using Npgsql;

namespace DocumentationBackend.Middleware;

/// <summary>Gestion centralisée des exceptions non gérées — pas de fuite de détail hors développement.</summary>
public sealed class UnhandledExceptionMiddleware(
    RequestDelegate next,
    ILogger<UnhandledExceptionMiddleware> logger,
    IHostEnvironment environment)
{
    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            IDisposable? logScope = null;
            if (context.Items.TryGetValue(DocumentationCorrelationMiddleware.CorrelationIdItemKey, out var corrObj)
                && corrObj is Guid correlationGuid)
            {
                logScope = logger.BeginScope(new Dictionary<string, object>
                {
                    ["CorrelationId"] = correlationGuid.ToString("D"),
                });
            }

            try
            {
                logger.LogError(ex,
                    "Unhandled exception on {Method} {Path}",
                    context.Request.Method,
                    context.Request.Path);
            }
            finally
            {
                logScope?.Dispose();
            }

            if (context.Response.HasStarted)
                throw;

            context.Response.Clear();
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var postgres = FindPostgresException(ex);
            object body;
            if (environment.IsDevelopment())
            {
                var technical =
                    postgres is not null
                        ? $"PostgreSQL [{postgres.SqlState}] {postgres.Message}"
                        : $"{ex.GetType().Name}: {ex.Message}";
                body = new
                {
                    message = technical,
                    detail = ex.ToString(),
                    type = ex.GetType().Name,
                    traceId = context.TraceIdentifier,
                };
            }
            else
            {
                body = new
                {
                    message = "Erreur interne du serveur.",
                    traceId = context.TraceIdentifier,
                };
            }

            await context.Response.WriteAsync(JsonSerializer.Serialize(body, Json));
        }
    }

    private static PostgresException? FindPostgresException(Exception? ex)
    {
        while (ex is not null)
        {
            if (ex is PostgresException pg)
                return pg;
            ex = ex.InnerException;
        }

        return null;
    }
}
