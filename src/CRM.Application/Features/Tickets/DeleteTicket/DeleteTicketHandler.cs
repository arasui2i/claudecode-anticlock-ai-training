using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Tickets.DeleteTicket;

public class DeleteTicketHandler : IRequestHandler<DeleteTicketCommand, Unit>
{
    private readonly ITicketRepository _ticketRepository;

    public DeleteTicketHandler(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<Unit> Handle(DeleteTicketCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _ticketRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Ticket), request.Id);

        ticket.IsDeleted = true;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.UpdateAsync(ticket, cancellationToken);

        return Unit.Value;
    }
}
