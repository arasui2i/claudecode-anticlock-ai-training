using CRM.Application.Features.Tickets.CreateTicket;
using CRM.Application.Features.Tickets.DeleteTicket;
using CRM.Application.Features.Tickets.GetTicketById;
using CRM.Application.Features.Tickets.GetTickets;
using CRM.Application.Features.Tickets.UpdateTicket;
using CRM.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TicketsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Policy = "tickets.view")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetTicketsQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "tickets.view")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTicketByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "tickets.create")]
    public async Task<IActionResult> Create([FromBody] CreateTicketRequest request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateTicketCommand(
            request.Subject,
            request.AccountId,
            request.ContactId,
            request.Priority,
            request.Status), ct);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "tickets.edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTicketRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateTicketCommand(
            id,
            request.Subject,
            request.AccountId,
            request.ContactId,
            request.Priority,
            request.Status), ct);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "tickets.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteTicketCommand(id), ct);
        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateTicketRequest(
    string Subject,
    Guid? AccountId,
    Guid? ContactId,
    TicketPriority Priority,
    TicketStatus Status);

public record UpdateTicketRequest(
    string Subject,
    Guid? AccountId,
    Guid? ContactId,
    TicketPriority Priority,
    TicketStatus Status);
