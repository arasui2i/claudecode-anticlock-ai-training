using CRM.Application.Common.Exceptions;
using CRM.Application.Features.Customers.CreateCustomer;
using CRM.Application.Features.Customers.DeleteCustomer;
using CRM.Application.Features.Customers.GetCustomerById;
using CRM.Application.Features.Customers.GetCustomers;
using CRM.Application.Features.Customers.UpdateCustomer;
using CRM.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetCustomersQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCustomerByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request, CancellationToken ct)
    {
        try
        {
            var id = await _mediator.Send(new CreateCustomerCommand(
                request.FirstName,
                request.LastName,
                request.Company,
                request.Status,
                request.JobTitle,
                request.Gender,
                request.Age,
                request.Email,
                request.PhoneNumber,
                request.Industry,
                request.AnnualIncome,
                request.EmployeeCount,
                request.HeadquartersAddress), ct);

            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }
        catch (ValidationException ex) when (IsEmailConflict(ex))
        {
            return Conflict(EmailConflictProblem(ex));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerRequest request, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(new UpdateCustomerCommand(
                id,
                request.FirstName,
                request.LastName,
                request.Company,
                request.Status,
                request.JobTitle,
                request.Gender,
                request.Age,
                request.Email,
                request.PhoneNumber,
                request.Industry,
                request.AnnualIncome,
                request.EmployeeCount,
                request.HeadquartersAddress), ct);

            return NoContent();
        }
        catch (ValidationException ex) when (IsEmailConflict(ex))
        {
            return Conflict(EmailConflictProblem(ex));
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "customers.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCustomerCommand(id), ct);
        return NoContent();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static bool IsEmailConflict(ValidationException ex)
        => ex.Errors.TryGetValue("Email", out var msgs)
           && msgs.Any(m => m.Contains("already in use", StringComparison.OrdinalIgnoreCase));

    private static ProblemDetails EmailConflictProblem(ValidationException ex) => new()
    {
        Status = StatusCodes.Status409Conflict,
        Detail = ex.Errors["Email"].First(),
        Type   = "https://httpstatuses.io/409",
    };
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateCustomerRequest(
    string FirstName,
    string LastName,
    string? Company,
    CustomerStatus Status,
    string? JobTitle,
    Gender? Gender,
    int? Age,
    string Email,
    string? PhoneNumber,
    string? Industry,
    decimal? AnnualIncome,
    int? EmployeeCount,
    string? HeadquartersAddress);

public record UpdateCustomerRequest(
    string FirstName,
    string LastName,
    string? Company,
    CustomerStatus Status,
    string? JobTitle,
    Gender? Gender,
    int? Age,
    string Email,
    string? PhoneNumber,
    string? Industry,
    decimal? AnnualIncome,
    int? EmployeeCount,
    string? HeadquartersAddress);
