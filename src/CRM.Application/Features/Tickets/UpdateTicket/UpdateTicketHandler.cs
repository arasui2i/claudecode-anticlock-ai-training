using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Tickets.UpdateTicket;

public class UpdateTicketHandler : IRequestHandler<UpdateTicketCommand, Unit>
{
    private readonly ITicketRepository _ticketRepository;

    public UpdateTicketHandler(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<Unit> Handle(UpdateTicketCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _ticketRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Ticket), request.Id);

        ticket.Subject   = request.Subject;
        ticket.AccountId = request.AccountId;
        ticket.ContactId = request.ContactId;
        ticket.Priority  = request.Priority;
        ticket.Status    = request.Status;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.UpdateAsync(ticket, cancellationToken);

        return Unit.Value;
    }
}
