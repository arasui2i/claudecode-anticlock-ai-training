using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Activities.CreateActivity;

public record CreateActivityCommand(
    string Subject,
    ActivityType ActivityType,
    DateTime DueDate,
    ActivityStatus Status,
    Guid? AssignedTo
) : IRequest<Guid>;
