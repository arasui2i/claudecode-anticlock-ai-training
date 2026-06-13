using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Activities.GetActivityById;

public class GetActivityByIdHandler : IRequestHandler<GetActivityByIdQuery, ActivityDetailDto>
{
    private readonly IActivityRepository _activityRepository;

    public GetActivityByIdHandler(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<ActivityDetailDto> Handle(
        GetActivityByIdQuery request, CancellationToken cancellationToken)
    {
        var activity = await _activityRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Activity), request.Id);

        return new ActivityDetailDto(
            activity.Id,
            activity.Subject,
            activity.ActivityType,
            activity.DueDate,
            activity.Status,
            activity.AssignedTo,
            activity.AssignedUser is null
                ? null
                : $"{activity.AssignedUser.Username}".Trim(),
            activity.CreatedAt,
            activity.UpdatedAt);
    }
}
