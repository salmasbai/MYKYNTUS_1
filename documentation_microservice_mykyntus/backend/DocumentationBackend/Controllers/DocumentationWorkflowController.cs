using DocumentationBackend.Api;
using DocumentationBackend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DocumentationBackend.Controllers;

[ApiController]
[Route("api/documentation/data/workflow")]
public class DocumentationWorkflowController(DocumentationWorkflowService workflow) : ControllerBase
{
    [HttpPost("validate")]
    public async Task<ActionResult<DocumentRequestResponse>> Validate(
        [FromBody] WorkflowValidateBody body,
        CancellationToken ct)
    {
        var (res, code, err) = await workflow.ValidateAsync(body.DocumentRequestId, body.Comment, ct);
        return Map(code, res, err);
    }

    [HttpPost("approve")]
    public async Task<ActionResult<DocumentRequestResponse>> Approve(
        [FromBody] WorkflowApproveBody body,
        CancellationToken ct)
    {
        var (res, code, err) = await workflow.ApproveAsync(body.DocumentRequestId, ct);
        return Map(code, res, err);
    }

    [HttpPost("reject")]
    public async Task<ActionResult<DocumentRequestResponse>> Reject(
        [FromBody] WorkflowRejectBody body,
        CancellationToken ct)
    {
        var (res, code, err) = await workflow.RejectAsync(
            body.DocumentRequestId,
            body.RejectionReason ?? "",
            ct);
        return Map(code, res, err);
    }

    private ActionResult<DocumentRequestResponse> Map(int code, DocumentRequestResponse? res, string? err) =>
        code switch
        {
            StatusCodes.Status200OK => Ok(res!),
            StatusCodes.Status404NotFound => NotFound(new { message = err ?? "Demande introuvable." }),
            StatusCodes.Status403Forbidden => StatusCode(StatusCodes.Status403Forbidden, new { message = err }),
            StatusCodes.Status400BadRequest => BadRequest(new { message = err }),
            StatusCodes.Status409Conflict => Conflict(new { message = err }),
            _ => StatusCode(code, new { message = err }),
        };
}

public sealed class WorkflowValidateBody
{
    public Guid DocumentRequestId { get; set; }
    public string? Comment { get; set; }
}

public sealed class WorkflowApproveBody
{
    public Guid DocumentRequestId { get; set; }
}

public sealed class WorkflowRejectBody
{
    public Guid DocumentRequestId { get; set; }
    public string? RejectionReason { get; set; }
}
