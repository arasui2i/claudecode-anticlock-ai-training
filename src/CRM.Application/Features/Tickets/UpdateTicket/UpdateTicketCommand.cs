using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Tickets.UpdateTicket;

public record UpdateTicketCommand(
    Guid Id,
    string Subject,
    Guid? AccountId,
    Guid? ContactId,
    TicketPriority Priority,
    TicketStatus Status
) : IRequest<Unit>;
