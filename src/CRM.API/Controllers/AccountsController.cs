using CRM.Application.Features.Accounts.CreateAccount;
using CRM.Application.Features.Accounts.DeleteAccount;
using CRM.Application.Features.Accounts.GetAccountById;
using CRM.Application.Features.Accounts.GetAccounts;
using CRM.Application.Features.Accounts.UpdateAccount;
using CRM.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/accounts")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Policy = "accounts.view")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAccountsQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "accounts.view")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAccountByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "accounts.create")]
    public async Task<IActionResult> Create([FromBody] CreateAccountRequest request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateAccountCommand(
            request.AccountName,
            request.Industry,
            request.Website,
            request.Phone,
            request.Status), ct);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "accounts.edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAccountRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateAccountCommand(
            id,
            request.AccountName,
            request.Industry,
            request.Website,
            request.Phone,
            request.Status), ct);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "accounts.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteAccountCommand(id), ct);
        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateAccountRequest(
    string AccountName,
    string? Industry,
    string? Website,
    string? Phone,
    AccountStatus Status);

public record UpdateAccountRequest(
    string AccountName,
    string? Industry,
    string? Website,
    string? Phone,
    AccountStatus Status);
