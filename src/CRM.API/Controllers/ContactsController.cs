using CRM.Application.Features.Contacts.CreateContact;
using CRM.Application.Features.Contacts.DeleteContact;
using CRM.Application.Features.Contacts.GetContactById;
using CRM.Application.Features.Contacts.GetContacts;
using CRM.Application.Features.Contacts.UpdateContact;
using CRM.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/contacts")]
[Authorize]
public class ContactsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContactsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Policy = "contacts.view")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetContactsQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "contacts.view")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetContactByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "contacts.create")]
    public async Task<IActionResult> Create([FromBody] CreateContactRequest request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateContactCommand(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone,
            request.AccountId,
            request.Status), ct);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "contacts.edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContactRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateContactCommand(
            id,
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone,
            request.AccountId,
            request.Status), ct);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "contacts.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteContactCommand(id), ct);
        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateContactRequest(
    string FirstName,
    string? LastName,
    string Email,
    string? Phone,
    Guid? AccountId,
    ContactStatus Status);

public record UpdateContactRequest(
    string FirstName,
    string? LastName,
    string Email,
    string? Phone,
    Guid? AccountId,
    ContactStatus Status);
