using CRM.Application.Common;
using MediatR;

namespace CRM.Application.Features.Contacts.GetContacts;

public record GetContactsQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<ContactSummaryDto>>;
