using MediatR;

namespace CRM.Application.Features.Activities.DeleteActivity;

public record DeleteActivityCommand(Guid Id) : IRequest<Unit>;
