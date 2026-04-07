namespace DocumentationBackend.Services;

/// <summary>Erreur métier ou d’autorisation prévue (pas une exception technique).</summary>
public sealed record WorkflowFailure(int StatusCode, string Code, string Message);
