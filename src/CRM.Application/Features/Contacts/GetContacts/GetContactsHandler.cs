using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using MediatR;

namespace CRM.Application.Features.Contacts.GetContacts;

public class GetContactsHandler : IRequestHandler<GetContactsQuery, PagedResult<ContactSummaryDto>>
{
    private readonly IContactRepository _contactRepository;

    public GetContactsHandler(IContactRepository contactRepository)
    {
        _contactRepository = contactRepository;
    }

    public async Task<PagedResult<ContactSummaryDto>> Handle(
        GetContactsQuery request, CancellationToken cancellationToken)
    {
        var paged = await _contactRepository.GetPagedAsync(
            request.Search, request.Page, request.PageSize, cancellationToken);

        var dtos = paged.Items.Select(c => new ContactSummaryDto(
            c.Id,
            $"{c.FirstName} {c.LastName}".Trim(),
            c.Email,
            c.Phone)).ToList();

        return new PagedResult<ContactSummaryDto>
        {
            Items    = dtos,
            Total    = paged.Total,
            Page     = paged.Page,
            PageSize = paged.PageSize,
        };
    }
}
