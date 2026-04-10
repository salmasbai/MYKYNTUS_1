using System.Text.RegularExpressions;

namespace DocumentationBackend.Services;

public interface ITemplateEngineService
{
    IReadOnlyList<DetectedTemplateVariable> DetectVariables(string content);
    string BuildRuleBasedContent(string description, IReadOnlyList<string> variableNames);
    string RenderContent(string structuredContent, IReadOnlyDictionary<string, string> values);
}

public sealed record DetectedTemplateVariable(string Name, string Type, bool IsRequired, string? ValidationRule);

public sealed class TemplateEngineService : ITemplateEngineService
{
    private static readonly Regex PlaceholderRegex = new(@"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}", RegexOptions.Compiled);

    public IReadOnlyList<DetectedTemplateVariable> DetectVariables(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return Array.Empty<DetectedTemplateVariable>();

        var names = PlaceholderRegex.Matches(content)
            .Select(m => m.Groups[1].Value.Trim())
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return names.Select(name =>
        {
            var lower = name.ToLowerInvariant();
            var type = lower.Contains("date") ? "date" :
                (lower.Contains("salaire") || lower.Contains("montant") || lower.Contains("prix")) ? "number" :
                "text";
            var validation = lower.Contains("cin") ? "^[A-Za-z0-9]{4,20}$" : null;
            return new DetectedTemplateVariable(name, type, true, validation);
        }).ToList();
    }

    public string BuildRuleBasedContent(string description, IReadOnlyList<string> variableNames)
    {
        var variables = variableNames.Count == 0
            ? "{{nom}}, {{prenom}}, {{cin}}, {{poste}}, {{date_embauche}}, {{departement}}"
            : string.Join(", ", variableNames.Select(v => $"{{{{{v}}}}}"));

        return
            $"[EN_TETE]\n" +
            "Société: MyKyntus Maroc\n" +
            "Ville: Casablanca\n" +
            "Date: {{date}}\n\n" +
            "[CORPS]\n" +
            $"Objet: {description}\n" +
            $"Informations collaborateur: {variables}\n" +
            "Ce document est établi pour servir et valoir ce que de droit.\n\n" +
            "[SIGNATURE]\n" +
            "Direction des Ressources Humaines";
    }

    public string RenderContent(string structuredContent, IReadOnlyDictionary<string, string> values)
    {
        if (string.IsNullOrEmpty(structuredContent))
            return structuredContent;

        var rendered = structuredContent;
        foreach (var kvp in values)
        {
            rendered = rendered.Replace($"{{{{{kvp.Key}}}}}", kvp.Value ?? string.Empty, StringComparison.OrdinalIgnoreCase);
        }

        return rendered;
    }
}
