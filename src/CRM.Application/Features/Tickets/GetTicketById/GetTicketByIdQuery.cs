using MediatR;

namespace CRM.Application.Features.Tickets.GetTicketById;

public record GetTicketByIdQuery(Guid Id) : IRequest<TicketDetailDto>;
