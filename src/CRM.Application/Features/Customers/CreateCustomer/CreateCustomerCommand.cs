using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Customers.CreateCustomer;

public record CreateCustomerCommand(
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
    string? HeadquartersAddress
) : IRequest<Guid>;
