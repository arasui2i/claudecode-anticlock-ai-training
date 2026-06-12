using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Opportunities.UpdateOpportunity;

public record UpdateOpportunityCommand(
    Guid Id,
    string OpportunityName,
    Guid AccountId,
    Guid? ContactId,
    OpportunityStage Stage,
    decimal? ExpectedRevenue,
    DateTime? CloseDate
) : IRequest<Unit>;
