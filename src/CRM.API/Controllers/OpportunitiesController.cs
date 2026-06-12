using CRM.Application.Features.Opportunities.CreateOpportunity;
using CRM.Application.Features.Opportunities.DeleteOpportunity;
using CRM.Application.Features.Opportunities.GetOpportunities;
using CRM.Application.Features.Opportunities.GetOpportunityById;
using CRM.Application.Features.Opportunities.UpdateOpportunity;
using CRM.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/opportunities")]
[Authorize]
public class OpportunitiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public OpportunitiesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Policy = "opportunities.view")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetOpportunitiesQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "opportunities.view")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOpportunityByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "opportunities.create")]
    public async Task<IActionResult> Create([FromBody] CreateOpportunityRequest request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateOpportunityCommand(
            request.OpportunityName,
            request.AccountId,
            request.ContactId,
            request.Stage,
            request.ExpectedRevenue,
            request.CloseDate), ct);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "opportunities.edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOpportunityRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateOpportunityCommand(
            id,
            request.OpportunityName,
            request.AccountId,
            request.ContactId,
            request.Stage,
            request.ExpectedRevenue,
            request.CloseDate), ct);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "opportunities.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteOpportunityCommand(id), ct);
        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateOpportunityRequest(
    string OpportunityName,
    Guid AccountId,
    Guid? ContactId,
    OpportunityStage Stage,
    decimal? ExpectedRevenue,
    DateTime? CloseDate);

public record UpdateOpportunityRequest(
    string OpportunityName,
    Guid AccountId,
    Guid? ContactId,
    OpportunityStage Stage,
    decimal? ExpectedRevenue,
    DateTime? CloseDate);
