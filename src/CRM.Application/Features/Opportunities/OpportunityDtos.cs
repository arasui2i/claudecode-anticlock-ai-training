using CRM.Domain.Enums;

namespace CRM.Application.Features.Opportunities;

public record OpportunitySummaryDto(
    Guid Id,
    string OpportunityName,
    string AccountName,
    OpportunityStage Stage,
    decimal? ExpectedRevenue);

public record OpportunityDetailDto(
    Guid Id,
    string OpportunityName,
    Guid AccountId,
    string AccountName,
    Guid? ContactId,
    string? ContactName,
    OpportunityStage Stage,
    decimal? ExpectedRevenue,
    DateTime? CloseDate,
    DateTime CreatedAt,
    DateTime UpdatedAt);
