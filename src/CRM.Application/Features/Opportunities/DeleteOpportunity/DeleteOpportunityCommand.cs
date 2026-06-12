using MediatR;

namespace CRM.Application.Features.Opportunities.DeleteOpportunity;

public record DeleteOpportunityCommand(Guid Id) : IRequest<Unit>;
