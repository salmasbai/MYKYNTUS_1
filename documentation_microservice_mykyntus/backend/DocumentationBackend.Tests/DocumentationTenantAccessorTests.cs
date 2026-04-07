using DocumentationBackend.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace DocumentationBackend.Tests;

public class DocumentationTenantAccessorTests
{
    [Fact]
    public void ResolvedTenantId_defaults_when_no_tenant_header()
    {
        var user = new DocumentationUserContext();
        var headers = new HeaderDictionary();
        var env = new Mock<IHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);

        user.LoadFromHeaders(headers, env.Object);

        var cfg = new Mock<IConfiguration>();
        cfg.Setup(c => c["Documentation:DefaultTenantId"]).Returns((string?)null);
        var accessor = new DocumentationTenantAccessor(user, cfg.Object, NullLogger<DocumentationTenantAccessor>.Instance);
        Assert.Equal("atlas-tech-demo", accessor.ResolvedTenantId);
    }

    [Fact]
    public void ResolvedTenantId_uses_x_tenant_id()
    {
        var user = new DocumentationUserContext();
        var headers = new HeaderDictionary
        {
            { "X-Tenant-Id", "acme-corp" },
        };
        var env = new Mock<IHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);

        user.LoadFromHeaders(headers, env.Object);
        Assert.Null(user.ValidationError);

        var cfg = new Mock<IConfiguration>();
        cfg.Setup(c => c["Documentation:DefaultTenantId"]).Returns((string?)null);
        var accessor = new DocumentationTenantAccessor(user, cfg.Object, NullLogger<DocumentationTenantAccessor>.Instance);
        Assert.Equal("acme-corp", accessor.ResolvedTenantId);
    }

    [Fact]
    public void ResolvedTenantId_uses_config_when_no_header()
    {
        var user = new DocumentationUserContext();
        var headers = new HeaderDictionary();
        var env = new Mock<IHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);
        user.LoadFromHeaders(headers, env.Object);

        var cfg = new Mock<IConfiguration>();
        cfg.Setup(c => c["Documentation:DefaultTenantId"]).Returns("tenant-from-config");
        var accessor = new DocumentationTenantAccessor(user, cfg.Object, NullLogger<DocumentationTenantAccessor>.Instance);
        Assert.Equal("tenant-from-config", accessor.ResolvedTenantId);
    }
}
