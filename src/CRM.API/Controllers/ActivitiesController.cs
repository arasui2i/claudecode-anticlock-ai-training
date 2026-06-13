using System.Security.Claims;
using CRM.Application.Features.Activities.CreateActivity;
using CRM.Application.Features.Activities.DeleteActivity;
using CRM.Application.Features.Activities.GetActivities;
using CRM.Application.Features.Activities.GetActivityById;
using CRM.Application.Features.Activities.UpdateActivity;
using CRM.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/activities")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ActivitiesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Policy = "activities.view")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetActivitiesQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "activities.view")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetActivityByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "activities.create")]
    public async Task<IActionResult> Create([FromBody] CreateActivityRequest request, CancellationToken ct)
    {
        var assignedTo = User.FindFirstValue(ClaimTypes.NameIdentifier) is { } raw
            && Guid.TryParse(raw, out var userId) ? userId : (Guid?)null;

        var id = await _mediator.Send(new CreateActivityCommand(
            request.Subject,
            request.ActivityType,
            request.DueDate,
            request.Status,
            assignedTo), ct);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "activities.edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateActivityRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateActivityCommand(
            id,
            request.Subject,
            request.ActivityType,
            request.DueDate,
            request.Status), ct);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "activities.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteActivityCommand(id), ct);
        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateActivityRequest(
    string Subject,
    ActivityType ActivityType,
    DateTime DueDate,
    ActivityStatus Status);

public record UpdateActivityRequest(
    string Subject,
    ActivityType ActivityType,
    DateTime DueDate,
    ActivityStatus Status);
