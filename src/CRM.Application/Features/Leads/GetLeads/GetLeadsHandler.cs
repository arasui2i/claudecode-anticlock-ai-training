using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using MediatR;

namespace CRM.Application.Features.Leads.GetLeads;

public class GetLeadsHandler : IRequestHandler<GetLeadsQuery, PagedResult<LeadSummaryDto>>
{
    private readonly ILeadRepository _leadRepository;

    public GetLeadsHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<PagedResult<LeadSummaryDto>> Handle(
        GetLeadsQuery request, CancellationToken cancellationToken)
    {
        var paged = await _leadRepository.GetPagedAsync(
            request.Search, request.Page, request.PageSize, cancellationToken);

        var dtos = paged.Items.Select(l => new LeadSummaryDto(
            l.Id,
            $"{l.FirstName} {l.LastName}".Trim(),
            l.CompanyName,
            l.Email,
            l.Status)).ToList();

        return new PagedResult<LeadSummaryDto>
        {
            Items    = dtos,
            Total    = paged.Total,
            Page     = paged.Page,
            PageSize = paged.PageSize,
        };
    }
}
