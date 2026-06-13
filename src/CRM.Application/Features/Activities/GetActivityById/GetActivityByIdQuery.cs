using MediatR;

namespace CRM.Application.Features.Activities.GetActivityById;

public record GetActivityByIdQuery(Guid Id) : IRequest<ActivityDetailDto>;
