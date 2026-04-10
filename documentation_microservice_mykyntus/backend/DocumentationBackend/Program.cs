using System.Data;
using System.Text.Json.Serialization;
using DocumentationBackend.Context;
using DocumentationBackend.Data;
using DocumentationBackend.Middleware;
using DocumentationBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("devCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://localhost:4202")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<DocumentationCorrelationContext>();
builder.Services.AddScoped<DocumentationUserContext>();
builder.Services.AddScoped<IDocumentationTenantAccessor, DocumentationTenantAccessor>();
builder.Services.AddScoped<DocumentationWorkflowService>();
builder.Services.AddSingleton<ITemplateEngineService, TemplateEngineService>();
builder.Services.AddSingleton<IPdfExportService, PdfExportService>();

var documentationCs = builder.Configuration.GetConnectionString("Documentation")
    ?? throw new InvalidOperationException("ConnectionStrings:Documentation manquante (voir appsettings).");

// Mot de passe hors chaîne ADO : évite les ambiguïtés avec caractères spéciaux (ex. !) et priorise DocumentationDb:Password.
var csb = new NpgsqlConnectionStringBuilder(documentationCs);
var documentationPassword = builder.Configuration["DocumentationDb:Password"];
if (!string.IsNullOrEmpty(documentationPassword))
    csb.Password = documentationPassword;

// Enregistrement des enums PostgreSQL (types créés dans le schéma « documentation »).
// Noms qualifiés obligatoires : sans « documentation. », Npgsql peut ne pas résoudre le type OID et lever une erreur à la lecture (500).
if (string.IsNullOrWhiteSpace(csb.SearchPath))
    csb.SearchPath = "documentation, public";

const string DocEnum = "documentation";
// Enums PostgreSQL : MapEnum sur NpgsqlDataSource (recommandé). Ne pas ajouter NpgsqlConnection.GlobalTypeMapper :
// obsolète, et en conflit avec cette source dédiée + EF HasPostgresEnum / HasColumnType.
var documentationDataSourceBuilder = new NpgsqlDataSourceBuilder(csb.ConnectionString);
documentationDataSourceBuilder.MapEnum<DocumentRequestStatus>($"{DocEnum}.document_request_status");
documentationDataSourceBuilder.MapEnum<GeneratedDocumentStatus>($"{DocEnum}.generated_document_status");
documentationDataSourceBuilder.MapEnum<WorkflowNotificationKey>($"{DocEnum}.workflow_notification_key");
documentationDataSourceBuilder.MapEnum<WorkflowActionKey>($"{DocEnum}.workflow_action_key");
documentationDataSourceBuilder.MapEnum<AppRole>($"{DocEnum}.app_role");
documentationDataSourceBuilder.MapEnum<StorageType>($"{DocEnum}.storage_type");
var documentationDataSource = documentationDataSourceBuilder.Build();
builder.Services.AddSingleton(documentationDataSource);

builder.Services.AddDbContext<DocumentationDbContext>((sp, options) =>
{
    options.UseNpgsql(sp.GetRequiredService<NpgsqlDataSource>(), npgsql =>
    {
        npgsql.MigrationsHistoryTable("__ef_migrations_history", "documentation");
        // EF Core 9+ : MapEnum sur le builder EF (en plus de NpgsqlDataSourceBuilder.MapEnum).
        // Sans cela, EF peut encore matérialiser les colonnes enum PostgreSQL comme Int32 → InvalidCastException.
        const string docSchema = "documentation";
        npgsql.MapEnum<AppRole>("app_role", docSchema);
        npgsql.MapEnum<DocumentRequestStatus>("document_request_status", docSchema);
        npgsql.MapEnum<GeneratedDocumentStatus>("generated_document_status", docSchema);
        npgsql.MapEnum<WorkflowNotificationKey>("workflow_notification_key", docSchema);
        npgsql.MapEnum<WorkflowActionKey>("workflow_action_key", docSchema);
        npgsql.MapEnum<StorageType>("storage_type", docSchema);
    });
    options.UseSnakeCaseNamingConvention();
});

var app = builder.Build();

app.UseMiddleware<UnhandledExceptionMiddleware>();
app.UseCors("devCors");
app.UseMiddleware<DocumentationCorrelationMiddleware>();
// Identité par en-têtes (X-User-Id, X-User-Role, X-Tenant-Id) → DocumentationUserContext (scoped), sans JWT dans ce service.
app.UseMiddleware<DocumentationUserContextMiddleware>();

app.MapGet("/health", () => Results.Json(new { status = "Healthy", service = "documentation" }));
app.MapGet("/healthz", () => Results.Json(new { status = "Healthy", service = "documentation" }));
app.MapGet("/ready", () => Results.Json(new { status = "Ready", service = "documentation" }));
app.MapGet("/api/documentation/health", () => Results.Json(new { status = "Healthy", service = "documentation" }));

// GET / n’avait aucune route → 404 dans les logs quand on ouvre http://localhost:5002/ dans le navigateur.
app.MapGet("/", () => Results.Json(new
{
    service = "DocumentationBackend",
    message = "API opérationnelle. Il n’y a pas de page HTML ici.",
    tryThese = new[] { "/health", "/api/documentation/db/status", "/api/documentation/health" },
}));

app.MapControllers();

app.MapGet("/api/documentation/db/status", async (
    DocumentationDbContext db,
    IConfiguration configuration,
    IHostEnvironment hostEnvironment,
    CancellationToken ct) =>
{
    var cs = configuration.GetConnectionString("Documentation") ?? "";
    var csb = new NpgsqlConnectionStringBuilder(cs);
    var statusPwd = configuration["DocumentationDb:Password"];
    if (!string.IsNullOrEmpty(statusPwd))
        csb.Password = statusPwd;

    try
    {
        var connection = db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(ct);
        try
        {
            var documentTypeCount = await db.DocumentTypes.CountAsync(ct);
            var documentRequestCount = await db.DocumentRequests.CountAsync(ct);
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT current_database()";
            var serverDbName = (await cmd.ExecuteScalarAsync(ct))?.ToString() ?? "";
            cmd.CommandText = "SELECT count(*)::bigint FROM documentation.document_requests";
            var documentRequestTotalAllTenants = Convert.ToInt64(await cmd.ExecuteScalarAsync(ct) ?? 0L);
            return Results.Ok(new
            {
                connected = true,
                schema = "documentation",
                serverDatabase = serverDbName,
                configuredHost = csb.Host,
                configuredPort = csb.Port,
                configuredDatabase = csb.Database,
                documentTypeCount,
                documentRequestCount,
                documentRequestTotalAllTenants,
                hint =
                    "Comparer serverDatabase / host / port avec la connexion pgAdmin. " +
                    "documentRequestCount suit le filtre tenant courant ; documentRequestTotalAllTenants compte toutes les lignes.",
            });
        }
        finally
        {
            if (connection.State == ConnectionState.Open)
                await connection.CloseAsync();
        }
    }
    catch (Exception ex)
    {
        if (!hostEnvironment.IsDevelopment())
        {
            return Results.Ok(new
            {
                connected = false,
                schema = "documentation",
                message = "Impossible de joindre PostgreSQL.",
            });
        }

        return Results.Ok(new
        {
            connected = false,
            schema = "documentation",
            message = "Impossible de joindre PostgreSQL.",
            errorType = ex.GetType().Name,
            errorMessage = ex.Message,
            host = csb.Host,
            port = csb.Port,
            database = csb.Database,
            username = csb.Username,
            passwordConfigured = !string.IsNullOrEmpty(csb.Password),
            passwordFromDocumentationDbKey = !string.IsNullOrEmpty(configuration["DocumentationDb:Password"]),
            hint = "28P01 = mot de passe refusé par PostgreSQL. Si le mot de passe contient des caractères spéciaux, placez-le dans DocumentationDb:Password (JSON). Sinon alignez le mot de passe : ALTER USER postgres WITH PASSWORD 'votre_mot_de_passe'; (en superutilisateur).",
        });
    }
});

app.Run();
