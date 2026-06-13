using CRM.Domain.Enums;

namespace CRM.Application.Features.Activities;

public record ActivitySummaryDto(
    Guid Id,
    string Subject,
    ActivityType ActivityType,
    DateTime DueDate,
    ActivityStatus Status);

public record ActivityDetailDto(
    Guid Id,
    string Subject,
    ActivityType ActivityType,
    DateTime DueDate,
    ActivityStatus Status,
    Guid? AssignedTo,
    string? AssignedUserName,
    DateTime CreatedAt,
    DateTime UpdatedAt);
