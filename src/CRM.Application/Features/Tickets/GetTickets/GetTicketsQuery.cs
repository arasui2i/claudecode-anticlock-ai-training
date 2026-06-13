using CRM.Application.Common;
using MediatR;

namespace CRM.Application.Features.Tickets.GetTickets;

public record GetTicketsQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<TicketSummaryDto>>;
