using Xunit;

namespace DocumentationBackend.Tests;

/// <summary>
/// Tests d’intégration du service de workflow recommandés : PostgreSQL + schéma 001–004 + en-têtes gateway.
/// À activer avec une base dédiée (ex. Testcontainers) plutôt qu’InMemory (enums PostgreSQL).
/// </summary>
public class DocumentationWorkflowServiceTests
{
    [Fact(Skip = "Intégration PostgreSQL — exécuter manuellement avec une base provisionnée.")]
    public Task ApproveAsync_happy_path_placeholder() => Task.CompletedTask;
}
