using CRM.Domain.Enums;

namespace CRM.Application.Features.Tickets;

public record TicketSummaryDto(
    Guid Id,
    string TicketNumber,
    string Subject,
    TicketPriority Priority,
    TicketStatus Status);

public record TicketDetailDto(
    Guid Id,
    string TicketNumber,
    string Subject,
    Guid? AccountId,
    string? AccountName,
    Guid? ContactId,
    string? ContactName,
    TicketPriority Priority,
    TicketStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt);
