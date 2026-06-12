using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Opportunities.UpdateOpportunity;

public class UpdateOpportunityHandler : IRequestHandler<UpdateOpportunityCommand, Unit>
{
    private readonly IOpportunityRepository _opportunityRepository;

    public UpdateOpportunityHandler(IOpportunityRepository opportunityRepository)
    {
        _opportunityRepository = opportunityRepository;
    }

    public async Task<Unit> Handle(UpdateOpportunityCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _opportunityRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Opportunity), request.Id);

        opportunity.OpportunityName = request.OpportunityName;
        opportunity.AccountId       = request.AccountId;
        opportunity.ContactId       = request.ContactId;
        opportunity.Stage           = request.Stage;
        opportunity.ExpectedRevenue = request.ExpectedRevenue;
        opportunity.CloseDate       = request.CloseDate;
        opportunity.UpdatedAt       = DateTime.UtcNow;

        await _opportunityRepository.UpdateAsync(opportunity, cancellationToken);

        return Unit.Value;
    }
}
