using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Tickets.CreateTicket;

public record CreateTicketCommand(
    string Subject,
    Guid? AccountId,
    Guid? ContactId,
    TicketPriority Priority,
    TicketStatus Status
) : IRequest<Guid>;
