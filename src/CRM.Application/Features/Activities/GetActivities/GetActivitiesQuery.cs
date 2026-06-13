using CRM.Application.Common;
using MediatR;

namespace CRM.Application.Features.Activities.GetActivities;

public record GetActivitiesQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<ActivitySummaryDto>>;
