# Démarre le microservice Documentation (Kestrel sur http://localhost:5002).
# À lancer depuis ce dossier :  .\run-documentation-backend.ps1
$ErrorActionPreference = 'Stop'
$proj = Join-Path $PSScriptRoot 'DocumentationBackend\DocumentationBackend.csproj'
if (-not (Test-Path $proj)) {
    throw "Fichier projet introuvable : $proj"
}
Write-Host 'Compilation DocumentationBackend...' -ForegroundColor Cyan
dotnet build $proj -c Debug
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host ''
Write-Host 'API : http://localhost:5002' -ForegroundColor Green
Write-Host 'Test pôles (après démarrage, autre fenêtre PowerShell) :' -ForegroundColor Yellow
Write-Host '  curl -s -H "X-User-Id: 11111111-1111-4111-8111-111111111101" -H "X-User-Role: pilote" -H "X-Tenant-Id: atlas-tech-demo" http://localhost:5002/api/documentation/data/organisation/poles' -ForegroundColor DarkGray
Write-Host ''
Write-Host 'Ctrl+C pour arrêter le serveur.' -ForegroundColor DarkYellow
Write-Host ''
dotnet run --project $proj --no-build
