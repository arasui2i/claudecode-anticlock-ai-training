using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Tickets.GetTicketById;

public class GetTicketByIdHandler : IRequestHandler<GetTicketByIdQuery, TicketDetailDto>
{
    private readonly ITicketRepository _ticketRepository;

    public GetTicketByIdHandler(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<TicketDetailDto> Handle(
        GetTicketByIdQuery request, CancellationToken cancellationToken)
    {
        var ticket = await _ticketRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Ticket), request.Id);

        return new TicketDetailDto(
            ticket.Id,
            ticket.TicketNumber,
            ticket.Subject,
            ticket.AccountId,
            ticket.Account?.AccountName,
            ticket.ContactId,
            ticket.Contact is null
                ? null
                : $"{ticket.Contact.FirstName} {ticket.Contact.LastName}".Trim(),
            ticket.Priority,
            ticket.Status,
            ticket.CreatedAt,
            ticket.UpdatedAt);
    }
}
