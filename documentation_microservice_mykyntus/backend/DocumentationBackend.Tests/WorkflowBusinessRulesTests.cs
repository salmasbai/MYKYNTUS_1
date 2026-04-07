using DocumentationBackend.Data;
using DocumentationBackend.Services;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace DocumentationBackend.Tests;

public class WorkflowBusinessRulesTests
{
    [Fact]
    public void EnsureCanValidate_coach_ok() =>
        Assert.Null(WorkflowBusinessRules.EnsureCanValidate(AppRole.Coach));

    [Fact]
    public void EnsureCanValidate_pilote_denied()
    {
        var f = WorkflowBusinessRules.EnsureCanValidate(AppRole.Pilote);
        Assert.NotNull(f);
        Assert.Equal(StatusCodes.Status403Forbidden, f!.StatusCode);
        Assert.Equal("ROLE_DENIED", f.Code);
    }

    [Fact]
    public void EnsurePending_when_not_pending_returns_conflict()
    {
        var f = WorkflowBusinessRules.EnsurePending(DocumentRequestStatus.Approved, "approve");
        Assert.NotNull(f);
        Assert.Equal(StatusCodes.Status409Conflict, f!.StatusCode);
        Assert.Equal("INVALID_STATE", f.Code);
    }

    [Fact]
    public void EnsureRejectReason_empty_returns_bad_request()
    {
        var f = WorkflowBusinessRules.EnsureRejectReason("  ");
        Assert.NotNull(f);
        Assert.Equal(StatusCodes.Status400BadRequest, f!.StatusCode);
        Assert.Equal("MISSING_REASON", f.Code);
    }
}
