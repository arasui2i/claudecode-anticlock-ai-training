using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Contacts.GetContactById;

public class GetContactByIdHandler : IRequestHandler<GetContactByIdQuery, ContactDetailDto>
{
    private readonly IContactRepository _contactRepository;

    public GetContactByIdHandler(IContactRepository contactRepository)
    {
        _contactRepository = contactRepository;
    }

    public async Task<ContactDetailDto> Handle(
        GetContactByIdQuery request, CancellationToken cancellationToken)
    {
        var contact = await _contactRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Contact), request.Id);

        return new ContactDetailDto(
            contact.Id,
            contact.FirstName,
            contact.LastName,
            contact.Email,
            contact.Phone,
            contact.AccountId,
            contact.Account?.AccountName,
            contact.Status,
            contact.CreatedAt,
            contact.UpdatedAt);
    }
}
