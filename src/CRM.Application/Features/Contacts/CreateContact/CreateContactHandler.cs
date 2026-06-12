using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Contacts.CreateContact;

public class CreateContactHandler : IRequestHandler<CreateContactCommand, Guid>
{
    private readonly IContactRepository _contactRepository;

    public CreateContactHandler(IContactRepository contactRepository)
    {
        _contactRepository = contactRepository;
    }

    public async Task<Guid> Handle(CreateContactCommand request, CancellationToken cancellationToken)
    {
        var contact = new Contact
        {
            FirstName = request.FirstName,
            LastName  = request.LastName,
            Email     = request.Email,
            Phone     = request.Phone,
            AccountId = request.AccountId,
            Status    = request.Status,
        };

        await _contactRepository.AddAsync(contact, cancellationToken);

        return contact.Id;
    }
}
