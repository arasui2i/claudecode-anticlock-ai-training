using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Opportunities.CreateOpportunity;

public record CreateOpportunityCommand(
    string OpportunityName,
    Guid AccountId,
    Guid? ContactId,
    OpportunityStage Stage,
    decimal? ExpectedRevenue,
    DateTime? CloseDate
) : IRequest<Guid>;
