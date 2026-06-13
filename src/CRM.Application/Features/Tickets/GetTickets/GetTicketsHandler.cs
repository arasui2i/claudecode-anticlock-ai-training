using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using MediatR;

namespace CRM.Application.Features.Tickets.GetTickets;

public class GetTicketsHandler : IRequestHandler<GetTicketsQuery, PagedResult<TicketSummaryDto>>
{
    private readonly ITicketRepository _ticketRepository;

    public GetTicketsHandler(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<PagedResult<TicketSummaryDto>> Handle(
        GetTicketsQuery request, CancellationToken cancellationToken)
    {
        var paged = await _ticketRepository.GetPagedAsync(
            request.Search, request.Page, request.PageSize, cancellationToken);

        var dtos = paged.Items.Select(t => new TicketSummaryDto(
            t.Id,
            t.TicketNumber,
            t.Subject,
            t.Priority,
            t.Status)).ToList();

        return new PagedResult<TicketSummaryDto>
        {
            Items    = dtos,
            Total    = paged.Total,
            Page     = paged.Page,
            PageSize = paged.PageSize,
        };
    }
}
