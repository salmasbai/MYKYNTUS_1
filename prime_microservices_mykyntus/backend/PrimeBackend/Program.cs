using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o =>
{
    // JSON properties in camelCase by default; keep consistent with Angular expectations.
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("devCors", policy =>
    {
        policy
            // Phase 1: allow dev origins. Tighten later.
            .WithOrigins("http://localhost:4201", "http://localhost:4202", "http://localhost:4203")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSingleton<PrimeInMemoryStore>();

var app = builder.Build();
app.UseCors("devCors");
app.MapControllers();
app.Run();

// -----------------------------
// Models (Prime)
// -----------------------------

public class Department
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public List<Pole> Poles { get; set; } = [];
}

public class Pole
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string DepartmentId { get; set; } = "";
    public List<Cellule> Cells { get; set; } = [];
}

public class Cellule
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string PoleId { get; set; } = "";
    public List<Team> Teams { get; set; } = [];
}

public class Team
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string CelluleId { get; set; } = "";
}

public class Employee
{
    public string Id { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    // Role values are kept as string to avoid breaking JSON contract.
    public string Role { get; set; } = "";
    /// <summary>Supérieur hiérarchique (Pilote→Coach→Manager→RP).</summary>
    public string? ParentId { get; set; }
    public string TeamId { get; set; } = "";
    /// <summary>Département → Pôle → Cellule (aligné sur la structure organisationnelle).</summary>
    public string DepartementId { get; set; } = "";
    public string PoleId { get; set; } = "";
    public string CelluleId { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Avatar { get; set; }
}

public class PrimeType
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public string DepartmentId { get; set; } = "";
    public string Status { get; set; } = "";
    public string? Description { get; set; }
}

public class PrimeRule
{
    public string Id { get; set; } = "";
    public string PrimeTypeId { get; set; } = "";
    public string? DepartmentId { get; set; }
    public string? PoleId { get; set; }
    public string? CelluleId { get; set; }
    public string? TeamId { get; set; }
    public string? RoleId { get; set; }
    public string ConditionField { get; set; } = "";
    public string ConditionType { get; set; } = "";
    public int TargetValue { get; set; }
    public string CalculationMethod { get; set; } = "";
    public int Amount { get; set; }
    public string Period { get; set; } = "";
}

public class PrimeResult
{
    public string Id { get; set; } = "";
    public string EmployeeId { get; set; } = "";
    public string PrimeTypeId { get; set; } = "";
    public int Score { get; set; }
    public int Amount { get; set; }
    public string Status { get; set; } = "";
    public string Period { get; set; } = "";
    public string? ApprovedBy { get; set; }
    public string Date { get; set; } = "";
}

// -----------------------------
// Models (RP)
// -----------------------------

public class RpTeamMemberPerformance
{
    public string EmployeeId { get; set; } = "";
    public string EmployeeName { get; set; } = "";
    public string ProjectId { get; set; } = "";
    public string ProjectName { get; set; } = "";
    public int CompletedTasks { get; set; }
    public int TotalTasks { get; set; }
    public int ObjectivesReached { get; set; }
    public int TotalObjectives { get; set; }
    public List<MonthlyPerformancePoint> MonthlyPerformance { get; set; } = [];
}

public class MonthlyPerformancePoint
{
    public string Month { get; set; } = "";
    public int Score { get; set; }
}

public class RpValidationItem
{
    public string Id { get; set; } = "";
    public string EmployeeId { get; set; } = "";
    public string EmployeeName { get; set; } = "";
    public string ProjectId { get; set; } = "";
    public string ProjectName { get; set; } = "";
    public int PerformanceScore { get; set; }
    public bool ManagerValidated { get; set; }
    public string Status { get; set; } = "";
    public string Period { get; set; } = "";
}

public class RpDashboardStats
{
    public int ProjectProgress { get; set; }
    public int CompletedTasks { get; set; }
    public int AverageTeamPerformance { get; set; }
    public int PendingValidations { get; set; }
    public List<MonthScore> PerformanceEvolution { get; set; } = [];
    public List<MemberPerformance> MemberPerformance { get; set; } = [];
}

public class MonthScore
{
    public string Month { get; set; } = "";
    public int Score { get; set; }
}

public class MemberPerformance
{
    public string Name { get; set; } = "";
    public int Score { get; set; }
    public string Status { get; set; } = "";
}

// -----------------------------
// Models (Admin)
// -----------------------------

public class AdminSystemKpi
{
    public int TotalGeneratedPrimes { get; set; }
    public int ValidationsInProgress { get; set; }
    public int ErrorCount { get; set; }
    public int AvgProcessingTimeSec { get; set; }
}

public class AdminSystemAlert
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string Message { get; set; } = "";
    public string Severity { get; set; } = "";
    public string Date { get; set; } = "";
}

public class AdminCalculationConfig
{
    public string Formula { get; set; } = "";
    public AdminCalculationWeights Weights { get; set; } = new();
    public AdminCalculationParameters Parameters { get; set; } = new();
}

public class AdminCalculationWeights
{
    public int IndividualPerformance { get; set; }
    public int TeamPerformance { get; set; }
    public int Objectives { get; set; }
}

public class AdminCalculationParameters
{
    public int Cap { get; set; }
    public int MinThreshold { get; set; }
    public int Bonus { get; set; }
}

public class AdminAuditLog
{
    public string Id { get; set; } = "";
    public string User { get; set; } = "";
    public string Action { get; set; } = "";
    public string Date { get; set; } = "";
}

public class AdminAnomaly
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string Description { get; set; } = "";
    public string Status { get; set; } = "";
}

public class AdminChartPoint
{
    public string Month { get; set; } = "";
    public int Value { get; set; }
}

public class AdminByDepartmentPoint
{
    public string Name { get; set; } = "";
    public int Value { get; set; }
}

public class AdminDashboardCharts
{
    public List<AdminChartPoint> VolumeByMonth { get; set; } = [];
    public List<AdminChartPoint> ValidationRate { get; set; } = [];
    public List<AdminByDepartmentPoint> ByDepartment { get; set; } = [];
}

public class AdminDashboardResponse
{
    public AdminSystemKpi Kpis { get; set; } = new();
    public AdminDashboardCharts Charts { get; set; } = new();
    public List<AdminSystemAlert> Alerts { get; set; } = [];
}

public class AdminWorkflowConfig
{
    public List<string> Steps { get; set; } = [];
    public int SlaHours { get; set; }
    public bool NotificationsEnabled { get; set; }
}

public class AdminRbacRow
{
    public string Role { get; set; } = "";
    public bool Read { get; set; }
    public bool Edit { get; set; }
    public bool Validate { get; set; }
    public bool Configure { get; set; }
}

// -----------------------------
// Models (Audit)
// -----------------------------

public class AuditValidationStep
{
    public string Role { get; set; } = "";
    public string Status { get; set; } = "";
    public string Date { get; set; } = "";
}

public class AuditOperation
{
    public string Id { get; set; } = "";
    public string EmployeeName { get; set; } = "";
    public string ProjectName { get; set; } = "";
    public List<AuditValidationStep> Steps { get; set; } = [];
    public string ValidatedBy { get; set; } = "";
    public string Date { get; set; } = "";
    public string Status { get; set; } = "";
}

public class AuditTrailLog
{
    public string Id { get; set; } = "";
    public string User { get; set; } = "";
    public string Action { get; set; } = "";
    public string Date { get; set; } = "";
    public string Detail { get; set; } = "";
}

public class AuditAnomaly
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string Description { get; set; } = "";
    public string? ValidationId { get; set; }
    public string Status { get; set; } = "";
}

public class AuditKpis
{
    public int TotalPrimes { get; set; }
    public int Validations { get; set; }
    public int Anomalies { get; set; }
    public int ConformityRate { get; set; }
}

public class AuditFlowByStepPoint
{
    public string Step { get; set; } = "";
    public int Value { get; set; }
}

public class AuditNamedPoint
{
    public string Name { get; set; } = "";
    public int Value { get; set; }
}

public class AuditActivityByRolePoint
{
    public string Role { get; set; } = "";
    public int Value { get; set; }
}

public class AuditDashboardCharts
{
    public List<AuditFlowByStepPoint> FlowByStep { get; set; } = [];
    public List<AuditNamedPoint> ValidationVsRejection { get; set; } = [];
    public List<AuditActivityByRolePoint> ActivityByRole { get; set; } = [];
}

public class AuditDashboardResponse
{
    public AuditKpis Kpis { get; set; } = new();
    public AuditDashboardCharts Charts { get; set; } = new();
}

// -----------------------------
// DTOs for updates
// -----------------------------

public class UpdatePrimeResultStatusRequest
{
    public string Status { get; set; } = "";
    public string? ApprovedBy { get; set; }
}

public class UpdateRpValidationStatusRequest
{
    public string Status { get; set; } = "";
}

public class UpdateAnomalyStatusRequest
{
    public string Status { get; set; } = "";
}

public class ToggleRbacPermissionRequest
{
    public string Role { get; set; } = "";
    public string Permission { get; set; } = ""; // read|edit|validate|configure
}

// -----------------------------
// In-memory store (mutable)
// -----------------------------

public class PrimeInMemoryStore
{
    private readonly List<Department> _departments;
    private readonly List<Employee> _employees;
    private readonly List<PrimeType> _primeTypes;
    private readonly List<PrimeRule> _primeRules;
    private readonly List<PrimeResult> _primeResults;

    private readonly Dictionary<string, List<string>> _rpProjectAssignments;
    private readonly List<RpTeamMemberPerformance> _rpTeamPerformance;
    private readonly List<RpValidationItem> _rpValidationItems;

    private readonly AdminCalculationConfig _adminCalculationConfig;
    private readonly List<AdminRbacRow> _adminRbacMatrix;
    private readonly AdminWorkflowConfig _adminWorkflow;
    private readonly List<AdminAuditLog> _adminAuditLogs;
    private readonly List<AdminAnomaly> _adminAnomalies;
    private readonly AdminDashboardCharts _adminCharts;
    private readonly List<AdminSystemAlert> _adminAlerts;
    private readonly AdminSystemKpi _adminSystemKpis;

    private readonly AuditKpis _auditKpis;
    private readonly AuditDashboardCharts _auditCharts;
    private readonly List<AuditOperation> _auditOperations;
    private readonly List<AuditTrailLog> _auditTrailLogs;
    private readonly List<AuditAnomaly> _auditAnomalies;

    public PrimeInMemoryStore()
    {
        // PrimeService mock-data (from TS)
        _departments =
        [
            new Department
            {
                Id = "d1",
                Name = "Operations",
                Poles =
                [
                    new Pole
                    {
                        Id = "p1",
                        Name = "Pôle Client",
                        DepartmentId = "d1",
                        Cells =
                        [
                            new Cellule
                            {
                                Id = "c1",
                                Name = "Support Client",
                                PoleId = "p1",
                                Teams =
                                [
                                    new Team { Id = "t1", Name = "Team Alpha", CelluleId = "c1" },
                                    new Team { Id = "t2", Name = "Team Beta", CelluleId = "c1" },
                                ]
                            },
                            new Cellule
                            {
                                Id = "c2",
                                Name = "Satisfaction Client",
                                PoleId = "p1",
                                Teams =
                                [
                                    new Team { Id = "t3", Name = "Team Gamma", CelluleId = "c2" },
                                ]
                            },
                        ]
                    },
                    new Pole
                    {
                        Id = "p2",
                        Name = "Pôle Escalade",
                        DepartmentId = "d1",
                        Cells =
                        [
                            new Cellule
                            {
                                Id = "c3",
                                Name = "Gestion de retards",
                                PoleId = "p2",
                                Teams =
                                [
                                    new Team { Id = "t4", Name = "Team Delta", CelluleId = "c3" },
                                ]
                            }
                        ]
                    }
                ]
            },
            new Department
            {
                Id = "d2",
                Name = "IT / Technical",
                Poles =
                [
                    new Pole
                    {
                        Id = "p3",
                        Name = "Infrastructure",
                        DepartmentId = "d2",
                        Cells =
                        [
                            new Cellule
                            {
                                Id = "c4",
                                Name = "Network",
                                PoleId = "p3",
                                Teams =
                                [
                                    new Team { Id = "t5", Name = "NetOps", CelluleId = "c4" },
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        _employees =
        [
            new Employee { Id = "e1", FirstName = "Alice", LastName = "Dupont", Role = "Pilote", ParentId = "e8", TeamId = "t1", Email = "alice.dupont@mykyntus.com" },
            new Employee { Id = "e2", FirstName = "Bob", LastName = "Martin", Role = "Pilote", ParentId = "e8", TeamId = "t1", Email = "bob.martin@mykyntus.com" },
            new Employee { Id = "e3", FirstName = "Charlie", LastName = "Durand", Role = "Manager", ParentId = "e6", TeamId = "t1", Email = "charlie.durand@mykyntus.com" },
            new Employee { Id = "e4", FirstName = "Diana", LastName = "Bernard", Role = "Pilote", ParentId = "e8", TeamId = "t2", Email = "diana.bernard@mykyntus.com" },
            new Employee { Id = "e5", FirstName = "Eve", LastName = "Thomas", Role = "RH", TeamId = "t5", Email = "eve.thomas@mykyntus.com" },
            new Employee { Id = "e6", FirstName = "Rachid", LastName = "El Amrani", Role = "RP", TeamId = "t1", Email = "rachid.elamrani@mykyntus.com" },
            new Employee { Id = "e7", FirstName = "Salma", LastName = "Bennani", Role = "Audit", TeamId = "t1", Email = "salma.bennani@mykyntus.com" },
            new Employee { Id = "e8", FirstName = "Marc", LastName = "Lefèvre", Role = "Coach", ParentId = "e3", TeamId = "t1", Email = "marc.lefevre@mykyntus.com" },
            new Employee { Id = "e-admin", FirstName = "Système", LastName = "Admin", Role = "Admin", TeamId = "t1", Email = "admin@mykyntus.com" }
        ];

        _primeTypes =
        [
            new PrimeType { Id = "pt1", Name = "Performance Bonus", Type = "Performance", DepartmentId = "d1", Status = "Active", Description = "Monthly performance bonus for operations" },
            new PrimeType { Id = "pt2", Name = "Zero Error Bonus", Type = "Quality", DepartmentId = "d1", Status = "Active", Description = "Bonus for 0 errors in a month" },
            new PrimeType { Id = "pt3", Name = "Overtime Bonus", Type = "Attendance", DepartmentId = "d2", Status = "Inactive", Description = "Bonus for extra hours" },
            new PrimeType { Id = "pt4", Name = "Escalation Resolution Bonus", Type = "Performance", DepartmentId = "d1", Status = "Active", Description = "Bonus for resolving escalations quickly" }
        ];

        _primeRules =
        [
            new PrimeRule
            {
                Id = "pr1",
                PrimeTypeId = "pt1",
                DepartmentId = "d1",
                ConditionField = "tickets_resolved",
                ConditionType = ">",
                TargetValue = 100,
                CalculationMethod = "Fixed",
                Amount = 300,
                Period = "Monthly"
            },
            new PrimeRule
            {
                Id = "pr2",
                PrimeTypeId = "pt2",
                DepartmentId = "d1",
                ConditionField = "errors",
                ConditionType = "==",
                TargetValue = 0,
                CalculationMethod = "Fixed",
                Amount = 500,
                Period = "Monthly"
            }
        ];

        _primeResults =
        [
            new PrimeResult { Id = "res1", EmployeeId = "e1", PrimeTypeId = "pt1", Score = 120, Amount = 300, Status = "Pending", Period = "2026-03", Date = "2026-03-15" },
            new PrimeResult { Id = "res2", EmployeeId = "e2", PrimeTypeId = "pt1", Score = 95, Amount = 0, Status = "Rejected", Period = "2026-03", Date = "2026-03-15" },
            new PrimeResult { Id = "res3", EmployeeId = "e4", PrimeTypeId = "pt2", Score = 0, Amount = 500, Status = "Coach Approved", Period = "2026-03", Date = "2026-03-14" },
            new PrimeResult { Id = "res4", EmployeeId = "e1", PrimeTypeId = "pt2", Score = 0, Amount = 500, Status = "RH Approved", Period = "2026-02", Date = "2026-02-28", ApprovedBy = "e5" },
            new PrimeResult { Id = "res5", EmployeeId = "e2", PrimeTypeId = "pt4", Score = 15, Amount = 450, Status = "RP Approved", Period = "2026-03", Date = "2026-03-10" },
            new PrimeResult { Id = "res6", EmployeeId = "e1", PrimeTypeId = "pt1", Score = 88, Amount = 200, Status = "Manager Approved", Period = "2026-03", Date = "2026-03-12" }
        ];

        // RP mock-data
        _rpProjectAssignments = new Dictionary<string, List<string>>
        {
            ["e6"] = ["proj-alpha"]
        };

        _rpTeamPerformance =
        [
            new RpTeamMemberPerformance
            {
                EmployeeId = "e1",
                EmployeeName = "Alice Dupont",
                ProjectId = "proj-alpha",
                ProjectName = "Projet Alpha",
                CompletedTasks = 26,
                TotalTasks = 30,
                ObjectivesReached = 4,
                TotalObjectives = 5,
                MonthlyPerformance =
                [
                    new MonthlyPerformancePoint { Month = "Oct", Score = 78 },
                    new MonthlyPerformancePoint { Month = "Nov", Score = 81 },
                    new MonthlyPerformancePoint { Month = "Dec", Score = 84 },
                    new MonthlyPerformancePoint { Month = "Jan", Score = 86 },
                    new MonthlyPerformancePoint { Month = "Feb", Score = 88 },
                    new MonthlyPerformancePoint { Month = "Mar", Score = 91 }
                ]
            },
            new RpTeamMemberPerformance
            {
                EmployeeId = "e2",
                EmployeeName = "Bob Martin",
                ProjectId = "proj-alpha",
                ProjectName = "Projet Alpha",
                CompletedTasks = 20,
                TotalTasks = 28,
                ObjectivesReached = 3,
                TotalObjectives = 5,
                MonthlyPerformance =
                [
                    new MonthlyPerformancePoint { Month = "Oct", Score = 70 },
                    new MonthlyPerformancePoint { Month = "Nov", Score = 72 },
                    new MonthlyPerformancePoint { Month = "Dec", Score = 74 },
                    new MonthlyPerformancePoint { Month = "Jan", Score = 76 },
                    new MonthlyPerformancePoint { Month = "Feb", Score = 78 },
                    new MonthlyPerformancePoint { Month = "Mar", Score = 80 }
                ]
            },
            new RpTeamMemberPerformance
            {
                EmployeeId = "e4",
                EmployeeName = "Diana Bernard",
                ProjectId = "proj-alpha",
                ProjectName = "Projet Alpha",
                CompletedTasks = 28,
                TotalTasks = 30,
                ObjectivesReached = 5,
                TotalObjectives = 5,
                MonthlyPerformance =
                [
                    new MonthlyPerformancePoint { Month = "Oct", Score = 82 },
                    new MonthlyPerformancePoint { Month = "Nov", Score = 85 },
                    new MonthlyPerformancePoint { Month = "Dec", Score = 87 },
                    new MonthlyPerformancePoint { Month = "Jan", Score = 89 },
                    new MonthlyPerformancePoint { Month = "Feb", Score = 92 },
                    new MonthlyPerformancePoint { Month = "Mar", Score = 94 }
                ]
            }
        ];

        _rpValidationItems =
        [
            new RpValidationItem { Id = "rpv1", EmployeeId = "e1", EmployeeName = "Alice Dupont", ProjectId = "proj-alpha", ProjectName = "Projet Alpha", PerformanceScore = 91, ManagerValidated = true, Status = "Manager Approved", Period = "2026-03" },
            new RpValidationItem { Id = "rpv2", EmployeeId = "e2", EmployeeName = "Bob Martin", ProjectId = "proj-alpha", ProjectName = "Projet Alpha", PerformanceScore = 80, ManagerValidated = true, Status = "Manager Approved", Period = "2026-03" }
        ];

        // Admin mock-data
        _adminSystemKpis = new AdminSystemKpi
        {
            TotalGeneratedPrimes = 1486,
            ValidationsInProgress = 73,
            ErrorCount = 12,
            AvgProcessingTimeSec = 42
        };

        _adminAlerts =
        [
            new AdminSystemAlert { Id = "alt1", Type = "Erreur systeme", Message = "Timeout moteur calcul sur lot #M2026-03-13", Severity = "Haute", Date = "2026-03-21 09:45" },
            new AdminSystemAlert { Id = "alt2", Type = "Incoherence", Message = "Scores manquants pour 3 employes (projet Alpha)", Severity = "Moyenne", Date = "2026-03-21 10:15" },
            new AdminSystemAlert { Id = "alt3", Type = "Workflow bloque", Message = "Validation RP en attente > SLA (48h)", Severity = "Moyenne", Date = "2026-03-21 11:02" }
        ];

        _adminCharts = new AdminDashboardCharts
        {
            VolumeByMonth =
            [
                new AdminChartPoint { Month = "Oct", Value = 980 },
                new AdminChartPoint { Month = "Nov", Value = 1050 },
                new AdminChartPoint { Month = "Dec", Value = 1125 },
                new AdminChartPoint { Month = "Jan", Value = 1180 },
                new AdminChartPoint { Month = "Feb", Value = 1260 },
                new AdminChartPoint { Month = "Mar", Value = 1486 }
            ],
            ValidationRate =
            [
                new AdminChartPoint { Month = "Oct", Value = 81 },
                new AdminChartPoint { Month = "Nov", Value = 84 },
                new AdminChartPoint { Month = "Dec", Value = 86 },
                new AdminChartPoint { Month = "Jan", Value = 88 },
                new AdminChartPoint { Month = "Feb", Value = 90 },
                new AdminChartPoint { Month = "Mar", Value = 92 }
            ],
            ByDepartment =
            [
                new AdminByDepartmentPoint { Name = "Operations", Value = 52 },
                new AdminByDepartmentPoint { Name = "IT", Value = 31 },
                new AdminByDepartmentPoint { Name = "RH", Value = 17 }
            ]
        };

        _adminCalculationConfig = new AdminCalculationConfig
        {
            Formula = "(ind_perf * w1) + (team_perf * w2) + (obj * w3) + bonus",
            Weights = new AdminCalculationWeights { IndividualPerformance = 50, TeamPerformance = 30, Objectives = 20 },
            Parameters = new AdminCalculationParameters { Cap = 1200, MinThreshold = 65, Bonus = 100 }
        };

        _adminRbacMatrix =
        [
            new AdminRbacRow { Role = "Admin", Read = true, Edit = true, Validate = true, Configure = true },
            new AdminRbacRow { Role = "RH", Read = true, Edit = true, Validate = true, Configure = false },
            new AdminRbacRow { Role = "Manager", Read = true, Edit = false, Validate = true, Configure = false },
            new AdminRbacRow { Role = "RP", Read = true, Edit = false, Validate = true, Configure = false }
        ];

        _adminWorkflow = new AdminWorkflowConfig
        {
            Steps = ["Manager", "RP", "RH"],
            SlaHours = 48,
            NotificationsEnabled = true
        };

        _adminAuditLogs =
        [
            new AdminAuditLog { Id = "log1", User = "admin@mykyntus.com", Action = "Mise a jour formule de calcul", Date = "2026-03-22 14:04" },
            new AdminAuditLog { Id = "log2", User = "eve.thomas@mykyntus.com", Action = "Validation RH du lot M-2026-03", Date = "2026-03-22 15:16" },
            new AdminAuditLog { Id = "log3", User = "charlie.durand@mykyntus.com", Action = "Validation manager du lot M-2026-03", Date = "2026-03-22 16:28" }
        ];

        _adminAnomalies =
        [
            new AdminAnomaly { Id = "an1", Type = "Erreur de calcul", Description = "Division par zero detectee sur formule legacy", Status = "Ouverte" },
            new AdminAnomaly { Id = "an2", Type = "Donnee manquante", Description = "Objectif mensuel absent pour e2", Status = "Ouverte" },
            new AdminAnomaly { Id = "an3", Type = "Erreur de calcul", Description = "Score hors bornes sur lot M2026-02", Status = "Corrigee" }
        ];

        // Audit mock-data
        _auditKpis = new AuditKpis { TotalPrimes = 1486, Validations = 312, Anomalies = 7, ConformityRate = 93 };

        _auditCharts = new AuditDashboardCharts
        {
            FlowByStep =
            [
                new AuditFlowByStepPoint { Step = "Manager", Value = 200 },
                new AuditFlowByStepPoint { Step = "RP", Value = 180 },
                new AuditFlowByStepPoint { Step = "RH", Value = 170 }
            ],
            ValidationVsRejection =
            [
                new AuditNamedPoint { Name = "Validé", Value = 282 },
                new AuditNamedPoint { Name = "Rejeté", Value = 30 }
            ],
            ActivityByRole =
            [
                new AuditActivityByRolePoint { Role = "Manager", Value = 120 },
                new AuditActivityByRolePoint { Role = "RP", Value = 95 },
                new AuditActivityByRolePoint { Role = "RH", Value = 85 }
            ]
        };

        _auditOperations =
        [
            new AuditOperation
            {
                Id = "op1",
                EmployeeName = "Alice Dupont",
                ProjectName = "Projet Alpha",
                Steps =
                [
                    new AuditValidationStep { Role = "Manager", Status = "OK", Date = "2026-03-10T09:40:00.000Z" },
                    new AuditValidationStep { Role = "RP", Status = "OK", Date = "2026-03-11T10:05:00.000Z" },
                    new AuditValidationStep { Role = "RH", Status = "OK", Date = "2026-03-12T11:20:00.000Z" }
                ],
                ValidatedBy = "RH",
                Date = "2026-03-12",
                Status = "Validé"
            },
            new AuditOperation
            {
                Id = "op2",
                EmployeeName = "Bob Martin",
                ProjectName = "Projet Alpha",
                Steps =
                [
                    new AuditValidationStep { Role = "Manager", Status = "OK", Date = "2026-03-10T08:15:00.000Z" },
                    new AuditValidationStep { Role = "RP", Status = "REJECTED", Date = "2026-03-11T09:00:00.000Z" }
                ],
                ValidatedBy = "RP",
                Date = "2026-03-11",
                Status = "Rejeté"
            },
            new AuditOperation
            {
                Id = "op3",
                EmployeeName = "Diana Bernard",
                ProjectName = "Projet Alpha",
                Steps =
                [
                    new AuditValidationStep { Role = "Manager", Status = "OK", Date = "2026-03-07T07:35:00.000Z" },
                    new AuditValidationStep { Role = "RP", Status = "OK", Date = "2026-03-08T08:25:00.000Z" }
                ],
                ValidatedBy = "RP",
                Date = "2026-03-08",
                Status = "En cours"
            },
            new AuditOperation
            {
                Id = "op4",
                EmployeeName = "Bob Martin",
                ProjectName = "Projet Alpha",
                Steps =
                [
                    new AuditValidationStep { Role = "Manager", Status = "OK", Date = "2026-02-27T12:10:00.000Z" },
                    new AuditValidationStep { Role = "RP", Status = "OK", Date = "2026-02-28T13:05:00.000Z" },
                    new AuditValidationStep { Role = "RH", Status = "REJECTED", Date = "2026-02-28T14:55:00.000Z" }
                ],
                ValidatedBy = "RH",
                Date = "2026-02-28",
                Status = "Rejeté"
            },
            new AuditOperation
            {
                Id = "op5",
                EmployeeName = "Alice Dupont",
                ProjectName = "Projet Alpha",
                Steps =
                [
                    new AuditValidationStep { Role = "Manager", Status = "OK", Date = "2026-02-18T10:05:00.000Z" }
                ],
                ValidatedBy = "Manager",
                Date = "2026-02-18",
                Status = "En cours"
            }
        ];

        _auditTrailLogs =
        [
            new AuditTrailLog { Id = "log-a1", User = "salma.bennani@mykyntus.com", Action = "Audit: consultation et export", Date = "2026-03-22T09:12:00.000Z", Detail = "Lecture des opérations pour le périmètre Projet Alpha." },
            new AuditTrailLog { Id = "log-a2", User = "charlie.durand@mykyntus.com", Action = "Workflow: validation Manager", Date = "2026-03-10T09:40:00.000Z", Detail = "Validation de l’étape Manager sur op1." },
            new AuditTrailLog { Id = "log-a3", User = "rachid.elamrani@mykyntus.com", Action = "Workflow: validation RP", Date = "2026-03-11T10:05:00.000Z", Detail = "Validation de l’étape RP sur op1." },
            new AuditTrailLog { Id = "log-a4", User = "eve.thomas@mykyntus.com", Action = "Workflow: validation RH", Date = "2026-03-12T11:20:00.000Z", Detail = "Validation de l’étape RH sur op1." }
        ];

        _auditAnomalies =
        [
            new AuditAnomaly { Id = "anom-1", Type = "Incohérence", Description = "Une étape RP manquante a été détectée après validation Manager.", ValidationId = "op3", Status = "Ouverte" },
            new AuditAnomaly { Id = "anom-2", Type = "Erreur de calcul", Description = "Score hors bornes sur l’intervalle 2026-02.", ValidationId = "op4", Status = "Ouverte" },
            new AuditAnomaly { Id = "anom-3", Type = "Validation manquante", Description = "Validation RH non enregistrée sur op5.", ValidationId = "op5", Status = "Ouverte" },
            new AuditAnomaly { Id = "anom-4", Type = "Incohérence", Description = "Rejet sans motif détaillé disponible.", ValidationId = "op2", Status = "Corrigée" }
        ];
    }

    // Prime getters
    public List<Department> GetDepartments() => _departments;
    public List<Employee> GetEmployees() => _employees;
    public List<PrimeType> GetPrimeTypes() => _primeTypes;
    public List<PrimeRule> GetPrimeRules() => _primeRules;
    public List<PrimeResult> GetPrimeResults() => _primeResults;

    public List<PrimeResult> GetMyPrimeResults(string employeeId) =>
        _primeResults.Where(r => r.EmployeeId == employeeId).ToList();

    public PrimeResult UpdatePrimeResultStatus(string id, string status, string? approvedBy)
    {
        var result = _primeResults.FirstOrDefault(r => r.Id == id);
        if (result is null) throw new KeyNotFoundException("Result not found");
        result.Status = status;
        if (!string.IsNullOrWhiteSpace(approvedBy)) result.ApprovedBy = approvedBy;
        return result;
    }

    public object GetPrimeDashboardStats() => new
    {
        totalPrimesThisMonth = 1250,
        budgetConsumption = 75,
        topTeams = new[]
        {
            new { name = "Team Alpha", amount = 4500 },
            new { name = "Team Gamma", amount = 3200 },
            new { name = "Team Beta", amount = 2800 },
        },
        topEmployees = new[]
        {
            new { name = "Alice Dupont", amount = 800 },
            new { name = "Diana Bernard", amount = 500 },
            new { name = "Bob Martin", amount = 450 },
        },
        primeByDepartment = new[]
        {
            new { name = "Operations", value = 8500 },
            new { name = "IT / Technical", value = 1200 },
            new { name = "HR", value = 400 },
        },
        primeEvolution = new[]
        {
            new { month = "Oct", amount = 7000 },
            new { month = "Nov", amount = 8200 },
            new { month = "Dec", amount = 9500 },
            new { month = "Jan", amount = 8800 },
            new { month = "Feb", amount = 9100 },
            new { month = "Mar", amount = 10100 },
        }
    };

    // RP getters + computation
    public List<string> GetAssignedProjectIds(string rpUserId) =>
        _rpProjectAssignments.TryGetValue(rpUserId, out var list) && list.Count > 0 ? list : ["proj-alpha"];

    public RpDashboardStats GetRpDashboardStats(string rpUserId)
    {
        var projectIds = GetAssignedProjectIds(rpUserId);

        var projectTeamData = _rpTeamPerformance.Where(x => projectIds.Contains(x.ProjectId)).ToList();
        var projectValidationData = _rpValidationItems.Where(x => projectIds.Contains(x.ProjectId)).ToList();

        var totalCompletedTasks = projectTeamData.Sum(m => m.CompletedTasks);
        var totalTasks = projectTeamData.Sum(m => m.TotalTasks);
        var avgTeamPerformance = projectTeamData.Count == 0
            ? 0
            : (int)Math.Round(
                projectTeamData.Sum(member =>
                    Math.Round((member.CompletedTasks / Math.Max(member.TotalTasks, 1.0)) * 60
                               + (member.ObjectivesReached / Math.Max(member.TotalObjectives, 1.0)) * 40)
                / (double)projectTeamData.Count
            );

        List<MonthScore> performanceEvolution = [];
        if (projectTeamData.Count > 0 && projectTeamData[0].MonthlyPerformance.Count > 0)
        {
            for (int index = 0; index < projectTeamData[0].MonthlyPerformance.Count; index++)
            {
                var monthScores = projectTeamData.Sum(m => m.MonthlyPerformance[index].Score);
                var monthAverage = monthScores / (double)projectTeamData.Count;
                performanceEvolution.Add(new MonthScore
                {
                    Month = projectTeamData[0].MonthlyPerformance[index].Month,
                    Score = (int)Math.Round(monthAverage)
                });
            }
        }

        var memberPerformance = projectTeamData.Select(member =>
        {
            var score = (int)Math.Round(
                (member.CompletedTasks / (double)Math.Max(member.TotalTasks, 1)) * 60
              + (member.ObjectivesReached / (double)Math.Max(member.TotalObjectives, 1)) * 40
            );
            var status = score >= 85 ? "Excellent" : score >= 70 ? "Moyen" : "Faible";
            return new MemberPerformance { Name = member.EmployeeName, Score = score, Status = status };
        }).ToList();

        return new RpDashboardStats
        {
            ProjectProgress = (int)Math.Round((totalCompletedTasks / (double)Math.Max(totalTasks, 1)) * 100),
            CompletedTasks = totalCompletedTasks,
            AverageTeamPerformance = avgTeamPerformance,
            PendingValidations = projectValidationData.Count(v => v.Status == "Manager Approved"),
            PerformanceEvolution = performanceEvolution,
            MemberPerformance = memberPerformance
        };
    }

    public List<RpTeamMemberPerformance> GetTeamPerformanceByProject(string rpUserId)
    {
        var projectIds = GetAssignedProjectIds(rpUserId);
        return _rpTeamPerformance.Where(x => projectIds.Contains(x.ProjectId)).ToList();
    }

    public List<RpValidationItem> GetManagerValidatedPrimes(string rpUserId)
    {
        var projectIds = GetAssignedProjectIds(rpUserId);
        return _rpValidationItems
            .Where(x => projectIds.Contains(x.ProjectId))
            .Where(x => x.ManagerValidated)
            .Select(x => x)
            .ToList();
    }

    public RpValidationItem UpdateRpValidationStatus(string id, string status)
    {
        var item = _rpValidationItems.FirstOrDefault(x => x.Id == id);
        if (item is null) throw new KeyNotFoundException("Validation introuvable");
        item.Status = status;
        return item;
    }

    // Admin getters + updates
    public AdminDashboardResponse GetAdminDashboard() =>
        new AdminDashboardResponse
        {
            Kpis = _adminSystemKpis,
            Charts = _adminCharts,
            Alerts = _adminAlerts
        };

    public AdminCalculationConfig GetCalculationConfig() => _adminCalculationConfig;

    public AdminCalculationConfig SaveCalculationConfig(AdminCalculationConfig payload)
    {
        _adminCalculationConfig.Formula = payload.Formula;
        _adminCalculationConfig.Weights = payload.Weights;
        _adminCalculationConfig.Parameters = payload.Parameters;
        return _adminCalculationConfig;
    }

    public List<AdminRbacRow> GetRbacMatrix() => _adminRbacMatrix;

    public List<AdminRbacRow> ToggleRbacPermission(string role, string permission)
    {
        var row = _adminRbacMatrix.FirstOrDefault(r => string.Equals(r.Role, role, StringComparison.OrdinalIgnoreCase));
        if (row is null) throw new KeyNotFoundException("Role introuvable");

        permission = (permission ?? "").Trim().ToLowerInvariant();
        switch (permission)
        {
            case "read": row.Read = !row.Read; break;
            case "edit": row.Edit = !row.Edit; break;
            case "validate": row.Validate = !row.Validate; break;
            case "configure": row.Configure = !row.Configure; break;
            default: throw new ArgumentException("Unknown permission");
        }
        return _adminRbacMatrix;
    }

    public AdminWorkflowConfig GetWorkflowConfig() => _adminWorkflow;

    public AdminWorkflowConfig SaveWorkflowConfig(AdminWorkflowConfig payload)
    {
        _adminWorkflow.Steps = payload.Steps;
        _adminWorkflow.SlaHours = payload.SlaHours;
        _adminWorkflow.NotificationsEnabled = payload.NotificationsEnabled;
        return _adminWorkflow;
    }

    public List<AdminAuditLog> GetAuditLogs() => _adminAuditLogs;

    public List<AdminAnomaly> GetAnomalies() => _adminAnomalies;

    public List<AdminAnomaly> UpdateAnomalyStatus(string id, string status)
    {
        var row = _adminAnomalies.FirstOrDefault(x => x.Id == id);
        if (row is null) throw new KeyNotFoundException("Anomalie introuvable");
        row.Status = status;
        return _adminAnomalies;
    }

    // Audit getters
    public AuditDashboardResponse GetAuditDashboard() =>
        new AuditDashboardResponse { Kpis = _auditKpis, Charts = _auditCharts };

    public List<AuditOperation> GetOperations() => _auditOperations;
    public List<AuditTrailLog> GetAuditTrailLogs() => _auditTrailLogs;
    public List<AuditAnomaly> GetAnomalies() => _auditAnomalies;
}

// -----------------------------
// Controllers
// -----------------------------

[ApiController]
[Route("api/prime")]
public class PrimeController(PrimeInMemoryStore store) : ControllerBase
{
    [HttpGet("departments")]
    public ActionResult<List<Department>> GetDepartments() => store.GetDepartments();

    [HttpGet("employees")]
    public ActionResult<List<Employee>> GetEmployees() => store.GetEmployees();

    [HttpGet("types")]
    public ActionResult<List<PrimeType>> GetPrimeTypes() => store.GetPrimeTypes();

    [HttpGet("rules")]
    public ActionResult<List<PrimeRule>> GetPrimeRules() => store.GetPrimeRules();

    [HttpGet("results")]
    public ActionResult<List<PrimeResult>> GetPrimeResults() => store.GetPrimeResults();

    [HttpGet("my-results")]
    public ActionResult<List<PrimeResult>> GetMyPrimeResults([FromQuery] string employeeId) =>
        store.GetMyPrimeResults(employeeId);

    [HttpPut("results/{id}/status")]
    public ActionResult<PrimeResult> UpdatePrimeResultStatus(string id, [FromBody] UpdatePrimeResultStatusRequest req)
    {
        var updated = store.UpdatePrimeResultStatus(id, req.Status, req.ApprovedBy);
        return Ok(updated);
    }

    [HttpGet("dashboard-stats")]
    public ActionResult<object> GetDashboardStats() => store.GetPrimeDashboardStats();
}

[ApiController]
[Route("api/rp")]
public class RpPrimeController(PrimeInMemoryStore store) : ControllerBase
{
    [HttpGet("assigned-project-ids")]
    public ActionResult<List<string>> GetAssignedProjectIds([FromQuery] string rpUserId) =>
        store.GetAssignedProjectIds(rpUserId);

    [HttpGet("dashboard-stats")]
    public ActionResult<RpDashboardStats> GetRpDashboardStats([FromQuery] string rpUserId) =>
        store.GetRpDashboardStats(rpUserId);

    [HttpGet("team-performance")]
    public ActionResult<List<RpTeamMemberPerformance>> GetTeamPerformanceByProject([FromQuery] string rpUserId) =>
        store.GetTeamPerformanceByProject(rpUserId);

    [HttpGet("manager-validated")]
    public ActionResult<List<RpValidationItem>> GetManagerValidatedPrimes([FromQuery] string rpUserId) =>
        store.GetManagerValidatedPrimes(rpUserId);

    [HttpPut("validations/{id}/status")]
    public ActionResult<RpValidationItem> UpdateRpValidationStatus(string id, [FromBody] UpdateRpValidationStatusRequest req)
    {
        var updated = store.UpdateRpValidationStatus(id, req.Status);
        return Ok(updated);
    }
}

[ApiController]
[Route("api/admin")]
public class AdminPrimeController(PrimeInMemoryStore store) : ControllerBase
{
    [HttpGet("dashboard")]
    public ActionResult<AdminDashboardResponse> GetDashboard() => store.GetAdminDashboard();

    [HttpGet("calculation-config")]
    public ActionResult<AdminCalculationConfig> GetCalculationConfig() => store.GetCalculationConfig();

    [HttpPut("calculation-config")]
    public ActionResult<AdminCalculationConfig> SaveCalculationConfig([FromBody] AdminCalculationConfig payload) =>
        store.SaveCalculationConfig(payload);

    [HttpGet("rbac-matrix")]
    public ActionResult<List<AdminRbacRow>> GetRbacMatrix() => store.GetRbacMatrix();

    [HttpPut("rbac-matrix/toggle")]
    public ActionResult<List<AdminRbacRow>> ToggleRbacPermission([FromBody] ToggleRbacPermissionRequest req) =>
        store.ToggleRbacPermission(req.Role, req.Permission);

    [HttpGet("workflow-config")]
    public ActionResult<AdminWorkflowConfig> GetWorkflowConfig() => store.GetWorkflowConfig();

    [HttpPut("workflow-config")]
    public ActionResult<AdminWorkflowConfig> SaveWorkflowConfig([FromBody] AdminWorkflowConfig payload) =>
        store.SaveWorkflowConfig(payload);

    [HttpGet("audit-logs")]
    public ActionResult<List<AdminAuditLog>> GetAuditLogs() => store.GetAuditLogs();

    [HttpGet("anomalies")]
    public ActionResult<List<AdminAnomaly>> GetAnomalies() => store.GetAnomalies();

    [HttpPut("anomalies/{id}/status")]
    public ActionResult<List<AdminAnomaly>> UpdateAnomalyStatus(string id, [FromBody] UpdateAnomalyStatusRequest req) =>
        store.UpdateAnomalyStatus(id, req.Status);
}

[ApiController]
[Route("api/audit")]
public class AuditPrimeController(PrimeInMemoryStore store) : ControllerBase
{
    [HttpGet("dashboard")]
    public ActionResult<AuditDashboardResponse> GetDashboard() => store.GetAuditDashboard();

    [HttpGet("operations")]
    public ActionResult<List<AuditOperation>> GetOperations() => store.GetOperations();

    [HttpGet("trail-logs")]
    public ActionResult<List<AuditTrailLog>> GetAuditTrailLogs() => store.GetAuditTrailLogs();

    [HttpGet("anomalies")]
    public ActionResult<List<AuditAnomaly>> GetAnomalies() => store.GetAnomalies();
}

