using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Activities.CreateActivity;

public class CreateActivityHandler : IRequestHandler<CreateActivityCommand, Guid>
{
    private readonly IActivityRepository _activityRepository;

    public CreateActivityHandler(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<Guid> Handle(CreateActivityCommand request, CancellationToken cancellationToken)
    {
        var activity = new Activity
        {
            Subject      = request.Subject,
            ActivityType = request.ActivityType,
            DueDate      = request.DueDate,
            Status       = request.Status,
            AssignedTo   = request.AssignedTo,
        };

        await _activityRepository.AddAsync(activity, cancellationToken);

        return activity.Id;
    }
}
