using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using MediatR;

namespace CRM.Application.Features.Opportunities.GetOpportunities;

public class GetOpportunitiesHandler : IRequestHandler<GetOpportunitiesQuery, PagedResult<OpportunitySummaryDto>>
{
    private readonly IOpportunityRepository _opportunityRepository;

    public GetOpportunitiesHandler(IOpportunityRepository opportunityRepository)
    {
        _opportunityRepository = opportunityRepository;
    }

    public async Task<PagedResult<OpportunitySummaryDto>> Handle(
        GetOpportunitiesQuery request, CancellationToken cancellationToken)
    {
        var paged = await _opportunityRepository.GetPagedAsync(
            request.Search, request.Page, request.PageSize, cancellationToken);

        var dtos = paged.Items.Select(o => new OpportunitySummaryDto(
            o.Id,
            o.OpportunityName,
            o.Account.AccountName,
            o.Stage,
            o.ExpectedRevenue)).ToList();

        return new PagedResult<OpportunitySummaryDto>
        {
            Items    = dtos,
            Total    = paged.Total,
            Page     = paged.Page,
            PageSize = paged.PageSize,
        };
    }
}
