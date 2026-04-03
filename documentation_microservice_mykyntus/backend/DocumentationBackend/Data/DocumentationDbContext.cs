using DocumentationBackend.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DocumentationBackend.Data;

public class DocumentationDbContext : DbContext
{
    public DocumentationDbContext(DbContextOptions<DocumentationDbContext> options)
        : base(options)
    {
    }

    public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
    public DbSet<Workflow> Workflows => Set<Workflow>();
    public DbSet<WorkflowStep> WorkflowSteps => Set<WorkflowStep>();
    public DbSet<WorkflowStepAction> WorkflowStepActions => Set<WorkflowStepAction>();
    public DbSet<DocumentRequest> DocumentRequests => Set<DocumentRequest>();
    public DbSet<GeneratedDocument> GeneratedDocuments => Set<GeneratedDocument>();
    public DbSet<DocumentTemplate> DocumentTemplates => Set<DocumentTemplate>();
    public DbSet<DocumentTemplateVariable> DocumentTemplateVariables => Set<DocumentTemplateVariable>();
    public DbSet<PermissionPolicy> PermissionPolicies => Set<PermissionPolicy>();
    public DbSet<DmsGeneralConfiguration> DmsGeneralConfigurations => Set<DmsGeneralConfiguration>();
    public DbSet<DmsStorageConfiguration> DmsStorageConfigurations => Set<DmsStorageConfiguration>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<DirectoryUser> DirectoryUsers => Set<DirectoryUser>();
    public DbSet<DocumentRequestSequence> DocumentRequestSequences => Set<DocumentRequestSequence>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("documentation");

        modelBuilder.HasPostgresEnum<DocumentRequestStatus>(schema: "documentation");
        modelBuilder.HasPostgresEnum<GeneratedDocumentStatus>(schema: "documentation");
        modelBuilder.HasPostgresEnum<WorkflowNotificationKey>(schema: "documentation");
        modelBuilder.HasPostgresEnum<WorkflowActionKey>(schema: "documentation");
        modelBuilder.HasPostgresEnum<AppRole>(schema: "documentation");
        modelBuilder.HasPostgresEnum<StorageType>(schema: "documentation");

        modelBuilder.Entity<Workflow>(e =>
        {
            e.ToTable("workflows");
            e.Property(x => x.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<DocumentType>(e =>
        {
            e.ToTable("document_types");
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.Code).HasMaxLength(64);
            e.Property(x => x.Name).HasMaxLength(255);
            e.Property(x => x.DepartmentCode).HasMaxLength(128);
            e.HasOne(x => x.Workflow)
                .WithMany(w => w.DocumentTypes)
                .HasForeignKey(x => x.WorkflowId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<WorkflowStep>(e =>
        {
            e.ToTable("workflow_steps");
            e.Property(x => x.StepKey).HasMaxLength(64);
            e.Property(x => x.Name).HasMaxLength(255);
            e.HasOne(x => x.Workflow)
                .WithMany(w => w.Steps)
                .HasForeignKey(x => x.WorkflowId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.WorkflowId);
        });

        modelBuilder.Entity<WorkflowStepAction>(e =>
        {
            e.ToTable("workflow_step_actions");
            e.HasKey(x => new { x.WorkflowStepId, x.Action });
            e.HasOne(x => x.Step)
                .WithMany(s => s.Actions)
                .HasForeignKey(x => x.WorkflowStepId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DocumentRequest>(e =>
        {
            e.ToTable("document_requests");
            e.HasIndex(x => x.RequestNumber).IsUnique();
            e.Property(x => x.RequestNumber).HasMaxLength(32);
            e.HasOne(x => x.DocumentType)
                .WithMany(t => t.DocumentRequests)
                .HasForeignKey(x => x.DocumentTypeId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<GeneratedDocument>(e =>
        {
            e.ToTable("generated_documents");
            e.Property(x => x.FileName).HasMaxLength(512);
            e.Property(x => x.MimeType).HasMaxLength(128);
            e.Property(x => x.ChecksumSha256).HasMaxLength(64);
            e.HasOne(x => x.DocumentRequest)
                .WithMany(r => r.GeneratedDocuments)
                .HasForeignKey(x => x.DocumentRequestId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.DocumentType)
                .WithMany(t => t.GeneratedDocuments)
                .HasForeignKey(x => x.DocumentTypeId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DocumentTemplate>(e =>
        {
            e.ToTable("document_templates");
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.Code).HasMaxLength(64);
            e.Property(x => x.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<DocumentTemplateVariable>(e =>
        {
            e.ToTable("document_template_variables");
            e.Property(x => x.VariableName).HasMaxLength(128);
            e.HasOne(x => x.Template)
                .WithMany(t => t.Variables)
                .HasForeignKey(x => x.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.TemplateId);
        });

        modelBuilder.Entity<PermissionPolicy>(e =>
        {
            e.ToTable("permission_policies");
            e.Property(x => x.DepartmentCode).HasMaxLength(128);
            e.HasOne(x => x.DocumentType)
                .WithMany(t => t.PermissionPolicies)
                .HasForeignKey(x => x.DocumentTypeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DmsGeneralConfiguration>(e =>
        {
            e.ToTable("dms_general_configuration");
            e.Property(x => x.SystemName).HasMaxLength(255);
            e.Property(x => x.DefaultLanguage).HasMaxLength(16);
            e.Property(x => x.DefaultTimezone).HasMaxLength(64);
            e.Property(x => x.NumberingPattern).HasMaxLength(128);
        });

        modelBuilder.Entity<DmsStorageConfiguration>(e =>
        {
            e.ToTable("dms_storage_configuration");
            e.Property(x => x.BucketName).HasMaxLength(255);
            e.Property(x => x.Region).HasMaxLength(64);
            e.Property(x => x.AccessKeyReference).HasMaxLength(512);
        });

        modelBuilder.Entity<AuditLog>(e =>
        {
            e.ToTable("audit_logs");
            e.Property(x => x.Action).HasMaxLength(64);
            e.Property(x => x.EntityType).HasMaxLength(64);
            e.Property(x => x.Details).HasColumnType("jsonb");
        });

        modelBuilder.Entity<DirectoryUser>(e =>
        {
            e.ToTable("directory_users");
            e.Property(x => x.TenantId).HasMaxLength(64);
            e.Property(x => x.Prenom).HasMaxLength(128);
            e.Property(x => x.Nom).HasMaxLength(128);
            e.Property(x => x.Email).HasMaxLength(255);
            e.HasIndex(x => x.TenantId);
        });

        modelBuilder.Entity<DocumentRequestSequence>(e =>
        {
            e.ToTable("document_request_sequences");
            e.HasKey(x => x.Year);
        });
    }
}
