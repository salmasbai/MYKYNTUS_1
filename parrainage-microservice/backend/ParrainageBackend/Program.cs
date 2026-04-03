using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("devCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:4203")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSingleton<ParrainageInMemoryStore>();

var app = builder.Build();
app.UseCors("devCors");
app.MapControllers();
app.Run();

// -----------------------------
// Models (shared contract)
// -----------------------------

public class Referral
{
    public string Id { get; set; } = "";
    public string ReferrerId { get; set; } = "";
    public string ReferrerName { get; set; } = "";
    public string ProjectId { get; set; } = "";
    public string ProjectName { get; set; } = "";
    public string TeamId { get; set; } = "";
    public string CandidateName { get; set; } = "";
    public string CandidateEmail { get; set; } = "";
    public string CandidatePhone { get; set; } = "";
    public string Position { get; set; } = "";
    public string Status { get; set; } = "";
    public int RewardAmount { get; set; }
    public string? CvUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReferralHistoryEntry
{
    public string Id { get; set; } = "";
    public string ReferralId { get; set; } = "";
    public string CandidateName { get; set; } = "";
    public string Action { get; set; } = "";
    public string PerformedById { get; set; } = "";
    public string PerformedByLabel { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public string? Comment { get; set; }
    public int? RewardAmount { get; set; }
}

public class ReferralRule
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public int Value { get; set; }
    public string? Target { get; set; }
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class ReferralNotification
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public bool Read { get; set; }
    public string? ReferralId { get; set; }
    public string? ReferrerId { get; set; }
    public List<string>? TargetRoles { get; set; }
}

public class NotificationPreferences
{
    public bool Email { get; set; }
    public bool InApp { get; set; }
    public bool? SystemAlerts { get; set; }
    public bool? Referrals { get; set; }
    public bool? Approvals { get; set; }
    public bool? Payments { get; set; }
}

public class SystemConfig
{
    public int DefaultBonusAmount { get; set; }
    public int MinDurationMonths { get; set; }
    public int ReferralLimitPerEmployee { get; set; }
    public int? PendingReferralAlertThreshold { get; set; }
}

public class AuditLogEntry
{
    public string Id { get; set; } = "";
    public string Action { get; set; } = "";
    public string UserId { get; set; } = "";
    public string UserLabel { get; set; } = "";
    public DateTime Timestamp { get; set; }
    public string? Details { get; set; }
}

public class UiPreferences
{
    public bool CompactMode { get; set; }
}

// -----------------------------
// Request DTOs
// -----------------------------

public class UpdateReferralStatusRequest
{
    public string Status { get; set; } = "";
    public string? ActorId { get; set; }
    public string? ActorLabel { get; set; }
    public string? Comment { get; set; }
}

public class UpdateReferralManualRequest
{
    public string? CandidateName { get; set; }
    public string? CandidateEmail { get; set; }
    public string? CandidatePhone { get; set; }
    public string? Position { get; set; }
    public string? ProjectName { get; set; }
    public string? Status { get; set; }
    public int? RewardAmount { get; set; }
}

public class AssignRewardRequest
{
    public int Amount { get; set; }
    public string? ActorId { get; set; }
    public string? ActorLabel { get; set; }
}

public class UpsertReferralRuleRequest
{
    public string? Id { get; set; }
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public int Value { get; set; }
    public string? Target { get; set; }
    public string Status { get; set; } = "";
}

public class UpdateNotificationPreferencesRequest
{
    public bool Email { get; set; }
    public bool InApp { get; set; }
    public bool? SystemAlerts { get; set; }
    public bool? Referrals { get; set; }
    public bool? Approvals { get; set; }
    public bool? Payments { get; set; }
}

public class UpdateSystemConfigRequest
{
    public int DefaultBonusAmount { get; set; }
    public int MinDurationMonths { get; set; }
    public int ReferralLimitPerEmployee { get; set; }
    public int? PendingReferralAlertThreshold { get; set; }

    public string ActorId { get; set; } = "";
    public string ActorLabel { get; set; } = "";
}

public class UpdateUiPreferencesRequest
{
    public bool CompactMode { get; set; }
}

public class SubmitReferralRequest
{
    public string ReferrerId { get; set; } = "";
    public string ReferrerName { get; set; } = "";
    public string CandidateName { get; set; } = "";
    public string CandidateEmail { get; set; } = "";
    public string CandidatePhone { get; set; } = "";
    public string Position { get; set; } = "";
    public string? Project { get; set; }
    public string? Notes { get; set; }
}

// -----------------------------
// Hiérarchie Pilote → Coach → Manager → RP (identifiants alignés sur le front)
// -----------------------------

private static readonly Dictionary<string, string?> OrgParentById = new()
{
    ["rp-1"] = null,
    ["mgr-1"] = "rp-1",
    ["coach-1"] = "mgr-1",
    ["emp-1"] = "coach-1",
    ["emp-2"] = "coach-1",
    ["emp-3"] = "coach-1",
    ["emp-4"] = "coach-1",
    ["emp-5"] = "coach-1",
};

private static bool IsReferrerInHierarchyScope(string viewerId, string referrerId)
{
    if (viewerId == referrerId) return true;
    string? cur = referrerId;
    var guard = new HashSet<string>();
    while (cur != null && OrgParentById.TryGetValue(cur, out var parent))
    {
        if (parent == viewerId) return true;
        if (!guard.Add(cur)) break;
        cur = parent;
    }
    return false;
}

// -----------------------------
// In-memory store (seed + mutations)
// -----------------------------

public class ParrainageInMemoryStore
{
    private readonly List<Referral> _referrals;
    private readonly List<ReferralHistoryEntry> _history;
    private readonly List<ReferralNotification> _notifications;
    private readonly List<ReferralRule> _rules;
    private NotificationPreferences _notificationPrefs;
    private SystemConfig _systemConfig;
    private readonly List<AuditLogEntry> _auditLog;
    private UiPreferences _uiPrefs;

    public ParrainageInMemoryStore()
    {
        _referrals = SeedReferrals();
        _rules = SeedRules();
        (_history, _notifications) = SeedHistoryAndNotifications(_referrals);

        _notificationPrefs = new NotificationPreferences
        {
            Email = true,
            InApp = true,
            SystemAlerts = false,
            Referrals = true,
            Approvals = true,
            Payments = true
        };

        _systemConfig = new SystemConfig
        {
            DefaultBonusAmount = 600,
            MinDurationMonths = 3,
            ReferralLimitPerEmployee = 10,
            PendingReferralAlertThreshold = 5
        };

        _auditLog = new List<AuditLogEntry>();
        _uiPrefs = new UiPreferences { CompactMode = false };
    }

    private static DateTime ToDate(object? v)
    {
        if (v is DateTime dt) return dt;
        if (v is string s && DateTime.TryParse(s, out var parsed)) return parsed;
        return DateTime.UtcNow;
    }

    private static List<Referral> SeedReferrals()
    {
        var now = DateTime.UtcNow;

        // Simplified but faithful dataset (initial seed values).
        var baseList = new List<ReferralSeed>
        {
            new ReferralSeed { Id="ref-1001", ReferrerId="emp-1", ReferrerName="Jean Dupont", ProjectId="proj-1", ProjectName="Alpha Digital", TeamId="team-a", CandidateName="Claire Martin", CandidateEmail="claire.martin@email.com", CandidatePhone="+33 6 12 34 56 78", Position="Développeur Full-Stack", Status="SUBMITTED" },
            new ReferralSeed { Id="ref-1002", ReferrerId="emp-1", ReferrerName="Jean Dupont", ProjectId="proj-1", ProjectName="Alpha Digital", TeamId="team-a", CandidateName="Paul Bernard", CandidateEmail="paul.bernard@email.com", CandidatePhone="+33 6 98 76 54 32", Position="Chef de projet", Status="APPROVED" },
            new ReferralSeed { Id="ref-1003", ReferrerId="emp-2", ReferrerName="Sophie Leroy", ProjectId="proj-2", ProjectName="Beta Ops", TeamId="team-b", CandidateName="Luc Petit", CandidateEmail="luc.petit@email.com", CandidatePhone="+33 6 11 22 33 44", Position="Analyste data", Status="REJECTED" },
            new ReferralSeed { Id="ref-1004", ReferrerId="emp-2", ReferrerName="Sophie Leroy", ProjectId="proj-2", ProjectName="Beta Ops", TeamId="team-b", CandidateName="Nadia Kaci", CandidateEmail="nadia.kaci@email.com", CandidatePhone="+33 6 55 66 77 88", Position="Développeur", Status="REWARDED" },
            new ReferralSeed { Id="ref-1005", ReferrerId="emp-3", ReferrerName="Thomas Bernard", ProjectId="proj-3", ProjectName="Gamma Cloud", TeamId="team-c", CandidateName="Amélie Rousseau", CandidateEmail="amelie.rousseau@email.com", CandidatePhone="+33 6 44 55 66 77", Position="DevOps", Status="SUBMITTED" },
            new ReferralSeed { Id="ref-1006", ReferrerId="emp-4", ReferrerName="Julie Moreau", ProjectId="proj-1", ProjectName="Alpha Digital", TeamId="team-a", CandidateName="Hugo Garnier", CandidateEmail="hugo.garnier@email.com", CandidatePhone="+33 6 22 33 44 55", Position="Développeur", Status="APPROVED" },
            new ReferralSeed { Id="ref-1007", ReferrerId="emp-5", ReferrerName="Karim Benali", ProjectId="proj-2", ProjectName="Beta Ops", TeamId="team-b", CandidateName="Sarah Cohen", CandidateEmail="sarah.cohen@email.com", CandidatePhone="+33 6 77 88 99 00", Position="Chef de produit", Status="SUBMITTED" },
            new ReferralSeed { Id="ref-1008", ReferrerId="emp-1", ReferrerName="Jean Dupont", ProjectId="proj-3", ProjectName="Gamma Cloud", TeamId="team-c", CandidateName="Marc Lefèvre", CandidateEmail="marc.lefevre@email.com", CandidatePhone="+33 6 10 20 30 40", Position="Architecte SI", Status="APPROVED" },
            new ReferralSeed { Id="ref-1009", ReferrerId="emp-3", ReferrerName="Thomas Bernard", ProjectId="proj-1", ProjectName="Alpha Digital", TeamId="team-a", CandidateName="Élodie Vincent", CandidateEmail="elodie.vincent@email.com", CandidatePhone="+33 6 31 41 51 61", Position="Designer UX", Status="REJECTED" },
            new ReferralSeed { Id="ref-1010", ReferrerId="emp-4", ReferrerName="Julie Moreau", ProjectId="proj-2", ProjectName="Beta Ops", TeamId="team-b", CandidateName="Nicolas Faure", CandidateEmail="nicolas.faure@email.com", CandidatePhone="+33 6 52 62 72 82", Position="Développeur", Status="REWARDED" },
            new ReferralSeed { Id="ref-1011", ReferrerId="emp-5", ReferrerName="Karim Benali", ProjectId="proj-3", ProjectName="Gamma Cloud", TeamId="team-c", CandidateName="Inès Hadj", CandidateEmail="ines.hadj@email.com", CandidatePhone="+33 6 93 83 73 63", Position="Scrum master", Status="SUBMITTED" },
            new ReferralSeed { Id="ref-1012", ReferrerId="emp-2", ReferrerName="Sophie Leroy", ProjectId="proj-1", ProjectName="Alpha Digital", TeamId="team-a", CandidateName="Claire Martin", CandidateEmail="claire.martin@email.com", CandidatePhone="+33 6 12 34 56 79", Position="Développeur", Status="SUBMITTED" },
            new ReferralSeed { Id="ref-1013", ReferrerId="emp-1", ReferrerName="Jean Dupont", ProjectId="proj-2", ProjectName="Beta Ops", TeamId="team-b", CandidateName="Antoine Dupuis", CandidateEmail="antoine.dupuis@email.com", CandidatePhone="+33 6 14 24 34 44", Position="Lead développement", Status="APPROVED" },
            new ReferralSeed { Id="ref-1014", ReferrerId="emp-3", ReferrerName="Thomas Bernard", ProjectId="proj-3", ProjectName="Gamma Cloud", TeamId="team-c", CandidateName="Léa Marchand", CandidateEmail="lea.marchand@email.com", CandidatePhone="+33 6 15 25 35 45", Position="Ingénieure données", Status="APPROVED" },
            new ReferralSeed { Id="ref-1015", ReferrerId="emp-4", ReferrerName="Julie Moreau", ProjectId="proj-1", ProjectName="Alpha Digital", TeamId="team-a", CandidateName="Youssef Alami", CandidateEmail="youssef.alami@email.com", CandidatePhone="+33 6 16 26 36 46", Position="Développeur", Status="APPROVED" },
        };

        var list = new List<Referral>();
        for (int idx = 0; idx < baseList.Count; idx++)
        {
            var r = baseList[idx];
            int rewardAmount = r.Status == "REWARDED" ? 600 + (idx % 3) * 50 : 0;

            list.Add(new Referral
            {
                Id = r.Id,
                ReferrerId = r.ReferrerId,
                ReferrerName = r.ReferrerName,
                ProjectId = r.ProjectId,
                ProjectName = r.ProjectName,
                TeamId = r.TeamId,
                CandidateName = r.CandidateName,
                CandidateEmail = r.CandidateEmail,
                CandidatePhone = r.CandidatePhone,
                Position = r.Position,
                Status = r.Status,
                RewardAmount = rewardAmount,
                CvUrl = null,
                CreatedAt = now.AddHours(-(idx * 12)).AddDays(-idx),
            });
        }

        return list;
    }

    private static List<ReferralRule> SeedRules()
    {
        var now = DateTime.UtcNow;
        return new List<ReferralRule>
        {
            new ReferralRule { Id="rule-1", Name="Récompense Développeur", Type="REWARD_PER_POSITION", Target="Développeur", Value=600, Status="ACTIVE", CreatedAt=now.AddDays(-30) },
            new ReferralRule { Id="rule-2", Name="Récompense Chef de projet", Type="REWARD_PER_POSITION", Target="Chef de projet", Value=750, Status="ACTIVE", CreatedAt=now.AddDays(-30) },
            new ReferralRule { Id="rule-3", Name="Récompense post-probatoire", Type="REWARD_AFTER_PROBATION", Target=null, Value=200, Status="PAUSED", CreatedAt=now.AddDays(-25) },
        };
    }

    private static (List<ReferralHistoryEntry> history, List<ReferralNotification> notifications) SeedHistoryAndNotifications(List<Referral> referrals)
    {
        var history = new List<ReferralHistoryEntry>();
        var notifications = new List<ReferralNotification>();

        DateTime now = DateTime.UtcNow;
        foreach (var r in referrals)
        {
            // SUBMITTED history + notification
            var submittedAt = r.CreatedAt;
            history.Add(new ReferralHistoryEntry
            {
                Id = $"hist-{r.Id}-sub",
                ReferralId = r.Id,
                CandidateName = r.CandidateName,
                Action = "SUBMITTED",
                PerformedById = r.ReferrerId,
                PerformedByLabel = r.ReferrerName,
                CreatedAt = submittedAt
            });

            notifications.Add(new ReferralNotification
            {
                Id = $"nt-{r.Id}-sub",
                Type = "NEW_REFERRAL",
                Message = $"Nouveau parrainage : {r.CandidateName} ({r.Position}) — {r.ProjectName}",
                CreatedAt = submittedAt,
                Read = false,
                ReferralId = r.Id,
                ReferrerId = r.ReferrerId,
                TargetRoles = new List<string> { "RH", "ADMIN", "MANAGER", "COACH", "RP" }
            });

            if (r.Status == "APPROVED")
            {
                var appAt = submittedAt.AddDays(3);
                history.Add(new ReferralHistoryEntry
                {
                    Id = $"hist-{r.Id}-app",
                    ReferralId = r.Id,
                    CandidateName = r.CandidateName,
                    Action = "APPROVED",
                    PerformedById = "rh-1",
                    PerformedByLabel = "RH",
                    CreatedAt = appAt
                });

                notifications.Add(new ReferralNotification
                {
                    Id = $"nt-{r.Id}-app",
                    Type = "STATUS_CHANGED",
                    Message = $"Parrainage validé : {r.CandidateName}",
                    CreatedAt = appAt,
                    Read = false,
                    ReferralId = r.Id,
                    ReferrerId = r.ReferrerId,
                    TargetRoles = new List<string> { "ALL" }
                });
            }

            if (r.Status == "REJECTED")
            {
                var rejAt = submittedAt.AddDays(5);
                history.Add(new ReferralHistoryEntry
                {
                    Id = $"hist-{r.Id}-rej",
                    ReferralId = r.Id,
                    CandidateName = r.CandidateName,
                    Action = "REJECTED",
                    PerformedById = "rh-1",
                    PerformedByLabel = "RH",
                    CreatedAt = rejAt,
                    Comment = "Profil non retenu."
                });

                notifications.Add(new ReferralNotification
                {
                    Id = $"nt-{r.Id}-rej",
                    Type = "STATUS_CHANGED",
                    Message = $"Parrainage refusé : {r.CandidateName}",
                    CreatedAt = rejAt,
                    Read = false,
                    ReferralId = r.Id,
                    ReferrerId = r.ReferrerId,
                    TargetRoles = new List<string> { "ALL" }
                });
            }

            if (r.Status == "REWARDED")
            {
                var appAt = submittedAt.AddDays(4);
                history.Add(new ReferralHistoryEntry
                {
                    Id = $"hist-{r.Id}-app2",
                    ReferralId = r.Id,
                    CandidateName = r.CandidateName,
                    Action = "APPROVED",
                    PerformedById = "rh-1",
                    PerformedByLabel = "RH",
                    CreatedAt = appAt
                });

                var rewAt = submittedAt.AddDays(16);
                history.Add(new ReferralHistoryEntry
                {
                    Id = $"hist-{r.Id}-rew",
                    ReferralId = r.Id,
                    CandidateName = r.CandidateName,
                    Action = "REWARDED",
                    PerformedById = "rh-1",
                    PerformedByLabel = "RH",
                    CreatedAt = rewAt,
                    RewardAmount = r.RewardAmount
                });

                notifications.Add(new ReferralNotification
                {
                    Id = $"nt-{r.Id}-rew",
                    Type = "REFERRAL_REWARDED",
                    Message = $"Prime enregistrée : {r.CandidateName} ({r.RewardAmount} €)",
                    CreatedAt = rewAt,
                    Read = false,
                    ReferralId = r.Id,
                    ReferrerId = r.ReferrerId,
                    TargetRoles = new List<string> { "RH", "ADMIN", "PILOTE", "MANAGER", "COACH", "RP" }
                });
            }
        }

        // Return history newest-first to match UI expectations.
        history = history.OrderByDescending(h => h.CreatedAt).ToList();
        notifications = notifications.OrderByDescending(n => n.CreatedAt).ToList();
        return (history, notifications);
    }

    private int ComputeSuggestedReward(Referral referral)
    {
        var active = _rules.Where(r => r.Status == "ACTIVE").ToList();
        var perPos = active.Where(r => r.Type == "REWARD_PER_POSITION").ToList();
        var hit = perPos.FirstOrDefault(r => (r.Target ?? "") == referral.Position);
        if (hit != null) return hit.Value;

        var fixedRule = active.FirstOrDefault(r => r.Type == "REWARD_AFTER_PROBATION");
        return fixedRule != null ? fixedRule.Value : _systemConfig.DefaultBonusAmount;
    }

    // -----------------------------
    // Referrals API
    // -----------------------------

    public List<Referral> GetAllReferrals() => _referrals.OrderByDescending(r => r.CreatedAt).Select(CloneReferral).ToList();

    public Referral? GetReferralById(string id)
    {
        var found = _referrals.FirstOrDefault(r => r.Id == id);
        return found == null ? null : CloneReferral(found);
    }

    public Referral? UpdateStatus(string id, string status, string? actorId, string? actorLabel, string? comment)
    {
        var idx = _referrals.FindIndex(r => r.Id == id);
        if (idx < 0) return null;

        var current = _referrals[idx];
        if (current.Status == "REWARDED") return CloneReferral(current);

        var next = new Referral
        {
            Id = current.Id,
            ReferrerId = current.ReferrerId,
            ReferrerName = current.ReferrerName,
            ProjectId = current.ProjectId,
            ProjectName = current.ProjectName,
            TeamId = current.TeamId,
            CandidateName = current.CandidateName,
            CandidateEmail = current.CandidateEmail,
            CandidatePhone = current.CandidatePhone,
            Position = current.Position,
            Status = status,
            RewardAmount = status == "REWARDED" ? current.RewardAmount : 0,
            CvUrl = current.CvUrl,
            CreatedAt = current.CreatedAt
        };

        _referrals[idx] = next;
        InsertHistoryAndNotification(next, status, actorId, actorLabel, comment);
        return CloneReferral(next);
    }

    private void InsertHistoryAndNotification(Referral referral, string action, string? actorId, string? actorLabel, string? comment)
    {
        var historyEntry = new ReferralHistoryEntry
        {
            Id = $"hist-{referral.Id}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            ReferralId = referral.Id,
            CandidateName = referral.CandidateName,
            Action = action,
            PerformedById = actorId ?? "rh-1",
            PerformedByLabel = actorLabel ?? "RH",
            CreatedAt = DateTime.UtcNow,
            Comment = comment
        };

        _history.Insert(0, historyEntry);

        _notifications.Insert(0, new ReferralNotification
        {
            Id = $"nt-{referral.Id}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Type = "STATUS_CHANGED",
            Message = $"Statut : {action} — {referral.CandidateName}",
            CreatedAt = historyEntry.CreatedAt,
            Read = false,
            ReferralId = referral.Id,
            ReferrerId = referral.ReferrerId,
            TargetRoles = new List<string> { "ALL" }
        });
    }

    public Referral? UpdateReferralManual(string id, UpdateReferralManualRequest patch, string? actorId, string? actorLabel)
    {
        var idx = _referrals.FindIndex(r => r.Id == id);
        if (idx < 0) return null;

        var current = _referrals[idx];
        var next = new Referral
        {
            Id = current.Id,
            ReferrerId = current.ReferrerId,
            ReferrerName = current.ReferrerName,
            ProjectId = current.ProjectId,
            ProjectName = patch.ProjectName ?? current.ProjectName,
            TeamId = current.TeamId,
            CandidateName = patch.CandidateName ?? current.CandidateName,
            CandidateEmail = patch.CandidateEmail ?? current.CandidateEmail,
            CandidatePhone = patch.CandidatePhone ?? current.CandidatePhone,
            Position = patch.Position ?? current.Position,
            Status = patch.Status ?? current.Status,
            RewardAmount = patch.RewardAmount ?? current.RewardAmount,
            CvUrl = current.CvUrl,
            CreatedAt = current.CreatedAt
        };

        _referrals[idx] = next;

        AddAuditLog(new AuditLogEntry
        {
            Id = $"audit-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Action = "CONFIG_UPDATE",
            UserId = actorId ?? "admin-1",
            UserLabel = actorLabel ?? "Administrateur",
            Timestamp = DateTime.UtcNow,
            Details = $"Modification manuelle du parrainage {id}"
        });

        return CloneReferral(next);
    }

    public Referral? AssignReward(string id, int amount, string? actorId, string? actorLabel)
    {
        var idx = _referrals.FindIndex(r => r.Id == id);
        if (idx < 0) return null;

        var current = _referrals[idx];
        if (current.Status != "APPROVED") return CloneReferral(current);

        var next = new Referral
        {
            Id = current.Id,
            ReferrerId = current.ReferrerId,
            ReferrerName = current.ReferrerName,
            ProjectId = current.ProjectId,
            ProjectName = current.ProjectName,
            TeamId = current.TeamId,
            CandidateName = current.CandidateName,
            CandidateEmail = current.CandidateEmail,
            CandidatePhone = current.CandidatePhone,
            Position = current.Position,
            Status = "REWARDED",
            RewardAmount = amount,
            CvUrl = current.CvUrl,
            CreatedAt = current.CreatedAt
        };

        _referrals[idx] = next;

        var now = DateTime.UtcNow;
        _history.Insert(0, new ReferralHistoryEntry
        {
            Id = $"hist-{id}-rew-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            ReferralId = id,
            CandidateName = current.CandidateName,
            Action = "REWARDED",
            PerformedById = actorId ?? "rh-1",
            PerformedByLabel = actorLabel ?? "RH",
            CreatedAt = now,
            RewardAmount = amount
        });

        _notifications.Insert(0, new ReferralNotification
        {
            Id = $"nt-{id}-rew-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Type = "REFERRAL_REWARDED",
            Message = $"Prime versée : {current.CandidateName} ({amount} €)",
            CreatedAt = now,
            Read = false,
            ReferralId = id,
            ReferrerId = current.ReferrerId,
            TargetRoles = new List<string> { "RH", "ADMIN", "PILOTE", "MANAGER", "COACH", "RP" }
        });

        return CloneReferral(next);
    }

    public List<ReferralHistoryEntry> GetHistory() => _history.Select(CloneHistory).ToList();

    public List<ReferralRule> GetRules() => _rules.OrderByDescending(r => r.CreatedAt).Select(CloneRule).ToList();

    public ReferralRule UpsertRule(UpsertReferralRuleRequest req)
    {
        // normalize type and status (lightweight)
        string normalizedType = req.Type is "REWARD_PER_POSITION" or "REWARD_AFTER_PROBATION" ? req.Type : "REWARD_PER_POSITION";
        string normalizedStatus = req.Status == "ACTIVE" ? "ACTIVE" : "PAUSED";

        if (!string.IsNullOrWhiteSpace(req.Id))
        {
            var idx = _rules.FindIndex(r => r.Id == req.Id);
            if (idx >= 0)
            {
                var updated = new ReferralRule
                {
                    Id = _rules[idx].Id,
                    Name = req.Name,
                    Type = normalizedType,
                    Value = req.Value,
                    Target = req.Target,
                    Status = normalizedStatus,
                    CreatedAt = _rules[idx].CreatedAt
                };
                _rules[idx] = updated;
                return CloneRule(updated);
            }
        }

        var created = new ReferralRule
        {
            Id = $"rule-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Name = req.Name,
            Type = normalizedType,
            Value = req.Value,
            Target = req.Target,
            Status = normalizedStatus,
            CreatedAt = DateTime.UtcNow
        };
        _rules.Insert(0, created);
        return CloneRule(created);
    }

    public bool DeleteRule(string ruleId)
    {
        int before = _rules.Count;
        _rules.RemoveAll(r => r.Id == ruleId);
        return _rules.Count != before;
    }

    public NotificationPreferences GetNotificationPreferences() => ClonePrefs(_notificationPrefs);

    public void UpdateNotificationPreferences(NotificationPreferences next)
    {
        _notificationPrefs = ClonePrefs(next);
    }

    public List<ReferralNotification> GetNotifications() => _notifications.Select(CloneNotification).ToList();

    public List<ReferralNotification> GetNotificationsForRole(string role, string userId, string? projectId)
    {
        // Implements same spirit as TS filters: role-based + project for PM.
        var all = _notifications;
        return all
            .Where(n =>
            {
                var targets = n.TargetRoles;
                if (targets != null && targets.Count > 0 && !targets.Contains("ALL"))
                {
                    if (!targets.Contains(role)) return false;
                }

                if (role == "PILOTE")
                {
                    if (!string.IsNullOrWhiteSpace(n.ReferrerId) && n.ReferrerId != userId) return false;
                    if (!string.IsNullOrWhiteSpace(n.ReferralId))
                    {
                        var refr = _referrals.FirstOrDefault(r => r.Id == n.ReferralId);
                        if (refr != null && refr.ReferrerId != userId) return false;
                    }
                }

                if ((role == "MANAGER" || role == "COACH") && !string.IsNullOrWhiteSpace(n.ReferralId))
                {
                    var refr = _referrals.FirstOrDefault(r => r.Id == n.ReferralId);
                    if (refr != null && !IsReferrerInHierarchyScope(userId, refr.ReferrerId)) return false;
                }

                return true;
            })
            .Select(CloneNotification)
            .ToList();
    }

    public void MarkNotificationAsRead(string notificationId)
    {
        var idx = _notifications.FindIndex(n => n.Id == notificationId);
        if (idx >= 0) _notifications[idx].Read = true;
    }

    public void MarkAllNotificationsAsRead()
    {
        for (int i = 0; i < _notifications.Count; i++)
        {
            _notifications[i].Read = true;
        }
    }

    public int GetSuggestedReward(string referralId)
    {
        var referral = _referrals.FirstOrDefault(r => r.Id == referralId);
        if (referral == null) return 500;
        return ComputeSuggestedReward(referral);
    }

    public Referral SubmitReferral(SubmitReferralRequest req)
    {
        var id = $"ref-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        var created = new Referral
        {
            Id = id,
            ReferrerId = req.ReferrerId,
            ReferrerName = req.ReferrerName,
            ProjectId = "proj-1",
            ProjectName = string.IsNullOrWhiteSpace(req.Project) ? "Projet" : req.Project!,
            TeamId = "team-a",
            CandidateName = req.CandidateName,
            CandidateEmail = req.CandidateEmail,
            CandidatePhone = req.CandidatePhone,
            Position = req.Position,
            Status = "SUBMITTED",
            RewardAmount = 0,
            CvUrl = null,
            CreatedAt = DateTime.UtcNow
        };

        _referrals.Insert(0, created);

        var now = created.CreatedAt;
        _history.Insert(0, new ReferralHistoryEntry
        {
            Id = $"hist-{id}-sub",
            ReferralId = id,
            CandidateName = created.CandidateName,
            Action = "SUBMITTED",
            PerformedById = created.ReferrerId,
            PerformedByLabel = created.ReferrerName,
            CreatedAt = now
        });

        _notifications.Insert(0, new ReferralNotification
        {
            Id = $"nt-{id}-sub",
            Type = "NEW_REFERRAL",
            Message = $"Nouveau parrainage : {created.CandidateName} ({created.Position})",
            CreatedAt = now,
            Read = false,
            ReferralId = id,
            ReferrerId = created.ReferrerId,
            TargetRoles = new List<string> { "RH", "ADMIN", "MANAGER", "COACH", "RP" }
        });

        return CloneReferral(created);
    }

    // -----------------------------
    // Admin/System
    // -----------------------------

    public SystemConfig GetSystemConfig() => new SystemConfig
    {
        DefaultBonusAmount = _systemConfig.DefaultBonusAmount,
        MinDurationMonths = _systemConfig.MinDurationMonths,
        ReferralLimitPerEmployee = _systemConfig.ReferralLimitPerEmployee,
        PendingReferralAlertThreshold = _systemConfig.PendingReferralAlertThreshold
    };

    public void UpdateSystemConfig(UpdateSystemConfigRequest req)
    {
        _systemConfig = new SystemConfig
        {
            DefaultBonusAmount = req.DefaultBonusAmount,
            MinDurationMonths = req.MinDurationMonths,
            ReferralLimitPerEmployee = req.ReferralLimitPerEmployee,
            PendingReferralAlertThreshold = req.PendingReferralAlertThreshold
        };

        AddAuditLog(new AuditLogEntry
        {
            Id = $"audit-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Action = "CONFIG_UPDATE",
            UserId = req.ActorId,
            UserLabel = req.ActorLabel,
            Timestamp = DateTime.UtcNow,
            Details = "Modification système"
        });
    }

    public List<AuditLogEntry> GetAuditLog() => _auditLog.OrderByDescending(a => a.Timestamp).Select(CloneAudit).ToList();

    // -----------------------------
    // Anomalies / Export
    // -----------------------------

    public object DetectAnomalies()
    {
        // duplicate candidates by email
        var byEmail = _referrals
            .GroupBy(r => (r.CandidateEmail ?? "").Trim().ToLowerInvariant())
            .Where(g => !string.IsNullOrWhiteSpace(g.Key) && g.Count() > 1)
            .Select(g => new
            {
                Email = g.Key,
                Referrals = g.ToList()
            })
            .ToList();

        var suspiciousEmails = byEmail.Select(x => new
        {
            Email = x.Email,
            Count = ((List<Referral>)x.Referrals).Count,
            ReferralIds = ((List<Referral>)x.Referrals).Select(r => r.Id).ToList()
        }).ToList();

        return new { DuplicateCandidates = byEmail, SuspiciousEmails = suspiciousEmails };
    }

    public string ExportDataSnapshot()
    {
        var snapshot = new
        {
            exportedAt = DateTime.UtcNow,
            referrals = _referrals,
            rules = _rules,
            history = _history,
            notifications = _notifications,
            notificationPreferences = _notificationPrefs,
            systemConfig = _systemConfig,
            auditLog = _auditLog
        };

        return System.Text.Json.JsonSerializer.Serialize(snapshot, new System.Text.Json.JsonSerializerOptions
        {
            WriteIndented = true
        });
    }

    private void AddAuditLog(AuditLogEntry entry)
    {
        _auditLog.Insert(0, entry);
    }

    // -----------------------------
    // Ui preferences
    // -----------------------------

    public UiPreferences GetUiPreferences() => new UiPreferences { CompactMode = _uiPrefs.CompactMode };

    public void SetUiPreferences(UpdateUiPreferencesRequest req) => _uiPrefs = new UiPreferences { CompactMode = req.CompactMode };

    // -----------------------------
    // Cloning helpers
    // -----------------------------

    private static Referral CloneReferral(Referral r) => new Referral
    {
        Id = r.Id,
        ReferrerId = r.ReferrerId,
        ReferrerName = r.ReferrerName,
        ProjectId = r.ProjectId,
        ProjectName = r.ProjectName,
        TeamId = r.TeamId,
        CandidateName = r.CandidateName,
        CandidateEmail = r.CandidateEmail,
        CandidatePhone = r.CandidatePhone,
        Position = r.Position,
        Status = r.Status,
        RewardAmount = r.RewardAmount,
        CvUrl = r.CvUrl,
        CreatedAt = r.CreatedAt
    };

    private static ReferralHistoryEntry CloneHistory(ReferralHistoryEntry h) => new ReferralHistoryEntry
    {
        Id = h.Id,
        ReferralId = h.ReferralId,
        CandidateName = h.CandidateName,
        Action = h.Action,
        PerformedById = h.PerformedById,
        PerformedByLabel = h.PerformedByLabel,
        CreatedAt = h.CreatedAt,
        Comment = h.Comment,
        RewardAmount = h.RewardAmount
    };

    private static ReferralRule CloneRule(ReferralRule r) => new ReferralRule
    {
        Id = r.Id,
        Name = r.Name,
        Type = r.Type,
        Value = r.Value,
        Target = r.Target,
        Status = r.Status,
        CreatedAt = r.CreatedAt
    };

    private static ReferralNotification CloneNotification(ReferralNotification n) => new ReferralNotification
    {
        Id = n.Id,
        Type = n.Type,
        Message = n.Message,
        CreatedAt = n.CreatedAt,
        Read = n.Read,
        ReferralId = n.ReferralId,
        ReferrerId = n.ReferrerId,
        TargetRoles = n.TargetRoles == null ? null : new List<string>(n.TargetRoles)
    };

    private static AuditLogEntry CloneAudit(AuditLogEntry a) => new AuditLogEntry
    {
        Id = a.Id,
        Action = a.Action,
        UserId = a.UserId,
        UserLabel = a.UserLabel,
        Timestamp = a.Timestamp,
        Details = a.Details
    };

    private static NotificationPreferences ClonePrefs(NotificationPreferences p) => new NotificationPreferences
    {
        Email = p.Email,
        InApp = p.InApp,
        SystemAlerts = p.SystemAlerts,
        Referrals = p.Referrals,
        Approvals = p.Approvals,
        Payments = p.Payments
    };

    private class ReferralSeed
    {
        public string Id { get; set; } = "";
        public string ReferrerId { get; set; } = "";
        public string ReferrerName { get; set; } = "";
        public string ProjectId { get; set; } = "";
        public string ProjectName { get; set; } = "";
        public string TeamId { get; set; } = "";
        public string CandidateName { get; set; } = "";
        public string CandidateEmail { get; set; } = "";
        public string CandidatePhone { get; set; } = "";
        public string Position { get; set; } = "";
        public string Status { get; set; } = "";
    }
}

// -----------------------------
// Controllers
// -----------------------------

[ApiController]
[Route("api/parrainage/referrals")]
public class ParrainageReferralsController(ParrainageInMemoryStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<List<Referral>> GetAll() => store.GetAllReferrals();

    [HttpGet("{id}")]
    public ActionResult<Referral> GetById(string id)
    {
        var found = store.GetReferralById(id);
        return found == null ? NotFound() : found;
    }

    [HttpPost("submit")]
    public ActionResult<Referral> Submit([FromBody] SubmitReferralRequest req) => store.SubmitReferral(req);

    [HttpPut("{id}/status")]
    public ActionResult<Referral> UpdateStatus(string id, [FromBody] UpdateReferralStatusRequest req)
    {
        var updated = store.UpdateStatus(id, req.Status, req.ActorId, req.ActorLabel, req.Comment);
        return updated == null ? NotFound() : updated;
    }

    [HttpPut("{id}/manual")]
    public ActionResult<Referral> UpdateManual(string id, [FromBody] UpdateReferralManualRequest patch)
    {
        var updated = store.UpdateReferralManual(id, patch, "admin-1", "Administrateur");
        return updated == null ? NotFound() : updated;
    }

    [HttpPut("{id}/reward")]
    public ActionResult<Referral> AssignReward(string id, [FromBody] AssignRewardRequest req)
    {
        var updated = store.AssignReward(id, req.Amount, req.ActorId, req.ActorLabel);
        return updated == null ? NotFound() : updated;
    }

    [HttpGet("{id}/suggested-reward")]
    public ActionResult<int> GetSuggestedReward(string id) => store.GetSuggestedReward(id);
}

[ApiController]
[Route("api/parrainage/history")]
public class ParrainageHistoryController(ParrainageInMemoryStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<List<ReferralHistoryEntry>> GetHistory() => store.GetHistory();
}

[ApiController]
[Route("api/parrainage/rules")]
public class ParrainageRulesController(ParrainageInMemoryStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<List<ReferralRule>> GetRules() => store.GetRules();

    [HttpPut]
    public ActionResult<ReferralRule> Upsert([FromBody] UpsertReferralRuleRequest req) => store.UpsertRule(req);

    [HttpDelete("{id}")]
    public ActionResult<bool> Delete(string id) => store.DeleteRule(id);
}

[ApiController]
[Route("api/parrainage/notifications")]
public class ParrainageNotificationsController(ParrainageInMemoryStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<List<ReferralNotification>> GetNotifications([FromQuery] string? role, [FromQuery] string? userId, [FromQuery] string? projectId)
    {
        if (!string.IsNullOrWhiteSpace(role) && !string.IsNullOrWhiteSpace(userId))
        {
            return store.GetNotificationsForRole(role, userId, projectId);
        }
        return store.GetNotifications();
    }

    [HttpGet("preferences")]
    public ActionResult<NotificationPreferences> GetPreferences() => store.GetNotificationPreferences();

    [HttpPut("preferences")]
    public ActionResult<NotificationPreferences> UpdatePreferences([FromBody] UpdateNotificationPreferencesRequest req)
    {
        store.UpdateNotificationPreferences(new NotificationPreferences
        {
            Email = req.Email,
            InApp = req.InApp,
            SystemAlerts = req.SystemAlerts,
            Referrals = req.Referrals,
            Approvals = req.Approvals,
            Payments = req.Payments
        });
        return store.GetNotificationPreferences();
    }

    [HttpPost("{id}/read")]
    public IActionResult MarkAsRead(string id)
    {
        store.MarkNotificationAsRead(id);
        return Ok();
    }

    [HttpPost("read-all")]
    public IActionResult MarkAllAsRead()
    {
        store.MarkAllNotificationsAsRead();
        return Ok();
    }
}

[ApiController]
[Route("api/parrainage/system")]
public class ParrainageSystemController(ParrainageInMemoryStore store) : ControllerBase
{
    [HttpGet("config")]
    public ActionResult<SystemConfig> GetConfig() => store.GetSystemConfig();

    [HttpPut("config")]
    public ActionResult<SystemConfig> UpdateConfig([FromBody] UpdateSystemConfigRequest req)
    {
        store.UpdateSystemConfig(req);
        return store.GetSystemConfig();
    }

    /// <summary>
    /// Journal d’audit : réservé aux administrateurs globaux. Le rôle RH est refusé (403).
    /// Envoyer l’en-tête X-User-Role (ex. ADMIN, RH) pour appliquer le contrôle.
    /// </summary>
    [HttpGet("audit-logs")]
    public IActionResult GetAuditLogs([FromHeader(Name = "X-User-Role")] string? role)
    {
        if (string.Equals(role, "RH", StringComparison.OrdinalIgnoreCase))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Audit réservé aux administrateurs." });
        return Ok(store.GetAuditLog());
    }
}

[ApiController]
[Route("api/parrainage/ui")]
public class ParrainageUiController(ParrainageInMemoryStore store) : ControllerBase
{
    [HttpGet("prefs")]
    public ActionResult<UiPreferences> GetPrefs() => store.GetUiPreferences();

    [HttpPut("prefs")]
    public IActionResult SetPrefs([FromBody] UpdateUiPreferencesRequest req)
    {
        store.SetUiPreferences(req);
        return Ok();
    }
}

[ApiController]
[Route("api/parrainage/admin")]
public class ParrainageAdminController(ParrainageInMemoryStore store) : ControllerBase
{
    [HttpGet("anomalies")]
    public ActionResult<object> GetAnomalies() => store.DetectAnomalies();

    [HttpGet("export-snapshot")]
    public ActionResult<string> ExportSnapshot() => store.ExportDataSnapshot();
}

