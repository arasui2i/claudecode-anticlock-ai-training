using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Opportunities.CreateOpportunity;

public class CreateOpportunityHandler : IRequestHandler<CreateOpportunityCommand, Guid>
{
    private readonly IOpportunityRepository _opportunityRepository;

    public CreateOpportunityHandler(IOpportunityRepository opportunityRepository)
    {
        _opportunityRepository = opportunityRepository;
    }

    public async Task<Guid> Handle(CreateOpportunityCommand request, CancellationToken cancellationToken)
    {
        var opportunity = new Opportunity
        {
            OpportunityName = request.OpportunityName,
            AccountId       = request.AccountId,
            ContactId       = request.ContactId,
            Stage           = request.Stage,
            ExpectedRevenue = request.ExpectedRevenue,
            CloseDate       = request.CloseDate,
        };

        await _opportunityRepository.AddAsync(opportunity, cancellationToken);

        return opportunity.Id;
    }
}
