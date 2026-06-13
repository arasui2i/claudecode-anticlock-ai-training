using MediatR;

namespace CRM.Application.Features.Tickets.DeleteTicket;

public record DeleteTicketCommand(Guid Id) : IRequest<Unit>;
