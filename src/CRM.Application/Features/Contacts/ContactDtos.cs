using CRM.Domain.Enums;

namespace CRM.Application.Features.Contacts;

public record ContactSummaryDto(
    Guid Id,
    string FullName,
    string Email,
    string? Phone);

public record ContactDetailDto(
    Guid Id,
    string FirstName,
    string? LastName,
    string Email,
    string? Phone,
    Guid? AccountId,
    string? AccountName,
    ContactStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt);
