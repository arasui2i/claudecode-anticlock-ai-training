using MediatR;

namespace CRM.Application.Features.Opportunities.GetOpportunityById;

public record GetOpportunityByIdQuery(Guid Id) : IRequest<OpportunityDetailDto>;
