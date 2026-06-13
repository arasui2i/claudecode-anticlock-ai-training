using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Tickets.CreateTicket;

public class CreateTicketHandler : IRequestHandler<CreateTicketCommand, Guid>
{
    private readonly ITicketRepository _ticketRepository;

    public CreateTicketHandler(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<Guid> Handle(CreateTicketCommand request, CancellationToken cancellationToken)
    {
        var ticketNumber = await _ticketRepository.GetNextTicketNumberAsync(cancellationToken);

        var ticket = new Ticket
        {
            TicketNumber = ticketNumber,
            Subject      = request.Subject,
            AccountId    = request.AccountId,
            ContactId    = request.ContactId,
            Priority     = request.Priority,
            Status       = request.Status,
        };

        await _ticketRepository.AddAsync(ticket, cancellationToken);

        return ticket.Id;
    }
}
