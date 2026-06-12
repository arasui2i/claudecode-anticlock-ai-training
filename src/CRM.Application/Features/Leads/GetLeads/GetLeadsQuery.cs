using CRM.Application.Common;
using MediatR;

namespace CRM.Application.Features.Leads.GetLeads;

public record GetLeadsQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<LeadSummaryDto>>;
