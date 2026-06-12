using CRM.Application.Features.Leads.CreateLead;
using CRM.Application.Features.Leads.DeleteLead;
using CRM.Application.Features.Leads.GetLeadById;
using CRM.Application.Features.Leads.GetLeads;
using CRM.Application.Features.Leads.UpdateLead;
using CRM.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/leads")]
[Authorize]
public class LeadsController : ControllerBase
{
    private readonly IMediator _mediator;

    public LeadsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Policy = "leads.view")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetLeadsQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "leads.view")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetLeadByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "leads.create")]
    public async Task<IActionResult> Create([FromBody] CreateLeadRequest request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateLeadCommand(
            request.FirstName,
            request.LastName,
            request.CompanyName,
            request.Email,
            request.Phone,
            request.Status,
            request.OwnerId), ct);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "leads.edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLeadRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateLeadCommand(
            id,
            request.FirstName,
            request.LastName,
            request.CompanyName,
            request.Email,
            request.Phone,
            request.Status,
            request.OwnerId), ct);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "leads.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteLeadCommand(id), ct);
        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateLeadRequest(
    string FirstName,
    string? LastName,
    string CompanyName,
    string Email,
    string? Phone,
    LeadStatus Status,
    Guid? OwnerId);

public record UpdateLeadRequest(
    string FirstName,
    string? LastName,
    string CompanyName,
    string Email,
    string? Phone,
    LeadStatus Status,
    Guid? OwnerId);
