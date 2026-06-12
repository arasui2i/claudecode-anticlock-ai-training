using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Opportunities.GetOpportunityById;

public class GetOpportunityByIdHandler : IRequestHandler<GetOpportunityByIdQuery, OpportunityDetailDto>
{
    private readonly IOpportunityRepository _opportunityRepository;

    public GetOpportunityByIdHandler(IOpportunityRepository opportunityRepository)
    {
        _opportunityRepository = opportunityRepository;
    }

    public async Task<OpportunityDetailDto> Handle(
        GetOpportunityByIdQuery request, CancellationToken cancellationToken)
    {
        var opportunity = await _opportunityRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Opportunity), request.Id);

        return new OpportunityDetailDto(
            opportunity.Id,
            opportunity.OpportunityName,
            opportunity.AccountId,
            opportunity.Account.AccountName,
            opportunity.ContactId,
            opportunity.Contact is null
                ? null
                : $"{opportunity.Contact.FirstName} {opportunity.Contact.LastName}".Trim(),
            opportunity.Stage,
            opportunity.ExpectedRevenue,
            opportunity.CloseDate,
            opportunity.CreatedAt,
            opportunity.UpdatedAt);
    }
}
