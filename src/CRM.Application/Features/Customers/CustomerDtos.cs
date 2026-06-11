using CRM.Domain.Enums;

namespace CRM.Application.Features.Customers;

public record CustomerSummaryDto(
    Guid Id,
    string FirstName,
    string LastName,
    string? Company,
    string Email,
    CustomerStatus Status,
    string? JobTitle,
    DateTime CreatedAt);

public record CustomerDetailDto(
    Guid Id,
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
    string? HeadquartersAddress,
    DateTime CreatedAt,
    DateTime UpdatedAt);
