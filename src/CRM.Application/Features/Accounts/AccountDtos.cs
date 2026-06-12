using CRM.Domain.Enums;

namespace CRM.Application.Features.Accounts;

public record AccountSummaryDto(
    Guid Id,
    string AccountName,
    string? Industry,
    string? Phone);

public record AccountDetailDto(
    Guid Id,
    string AccountName,
    string? Industry,
    string? Website,
    string? Phone,
    AccountStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt);
