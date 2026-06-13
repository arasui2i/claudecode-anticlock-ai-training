using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using MediatR;

namespace CRM.Application.Features.Activities.GetActivities;

public class GetActivitiesHandler : IRequestHandler<GetActivitiesQuery, PagedResult<ActivitySummaryDto>>
{
    private readonly IActivityRepository _activityRepository;

    public GetActivitiesHandler(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<PagedResult<ActivitySummaryDto>> Handle(
        GetActivitiesQuery request, CancellationToken cancellationToken)
    {
        var paged = await _activityRepository.GetPagedAsync(
            request.Search, request.Page, request.PageSize, cancellationToken);

        var dtos = paged.Items.Select(a => new ActivitySummaryDto(
            a.Id,
            a.Subject,
            a.ActivityType,
            a.DueDate,
            a.Status)).ToList();

        return new PagedResult<ActivitySummaryDto>
        {
            Items    = dtos,
            Total    = paged.Total,
            Page     = paged.Page,
            PageSize = paged.PageSize,
        };
    }
}
