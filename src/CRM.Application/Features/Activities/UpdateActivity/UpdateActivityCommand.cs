using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Activities.UpdateActivity;

public record UpdateActivityCommand(
    Guid Id,
    string Subject,
    ActivityType ActivityType,
    DateTime DueDate,
    ActivityStatus Status
) : IRequest<Unit>;
