using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Activities.UpdateActivity;

public class UpdateActivityHandler : IRequestHandler<UpdateActivityCommand, Unit>
{
    private readonly IActivityRepository _activityRepository;

    public UpdateActivityHandler(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<Unit> Handle(UpdateActivityCommand request, CancellationToken cancellationToken)
    {
        var activity = await _activityRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Activity), request.Id);

        activity.Subject      = request.Subject;
        activity.ActivityType = request.ActivityType;
        activity.DueDate      = request.DueDate;
        activity.Status       = request.Status;
        activity.UpdatedAt    = DateTime.UtcNow;

        await _activityRepository.UpdateAsync(activity, cancellationToken);

        return Unit.Value;
    }
}
