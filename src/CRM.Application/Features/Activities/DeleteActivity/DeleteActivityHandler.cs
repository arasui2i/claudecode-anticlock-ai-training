using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Activities.DeleteActivity;

public class DeleteActivityHandler : IRequestHandler<DeleteActivityCommand, Unit>
{
    private readonly IActivityRepository _activityRepository;

    public DeleteActivityHandler(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<Unit> Handle(DeleteActivityCommand request, CancellationToken cancellationToken)
    {
        var activity = await _activityRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Activity), request.Id);

        activity.IsDeleted = true;
        activity.UpdatedAt = DateTime.UtcNow;

        await _activityRepository.UpdateAsync(activity, cancellationToken);

        return Unit.Value;
    }
}
