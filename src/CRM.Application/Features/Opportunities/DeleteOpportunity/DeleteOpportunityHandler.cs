using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Opportunities.DeleteOpportunity;

public class DeleteOpportunityHandler : IRequestHandler<DeleteOpportunityCommand, Unit>
{
    private readonly IOpportunityRepository _opportunityRepository;

    public DeleteOpportunityHandler(IOpportunityRepository opportunityRepository)
    {
        _opportunityRepository = opportunityRepository;
    }

    public async Task<Unit> Handle(DeleteOpportunityCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _opportunityRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Opportunity), request.Id);

        opportunity.IsDeleted = true;
        opportunity.UpdatedAt = DateTime.UtcNow;

        await _opportunityRepository.UpdateAsync(opportunity, cancellationToken);

        return Unit.Value;
    }
}
