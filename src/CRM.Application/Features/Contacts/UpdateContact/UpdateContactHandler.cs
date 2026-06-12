using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Contacts.UpdateContact;

public class UpdateContactHandler : IRequestHandler<UpdateContactCommand, Unit>
{
    private readonly IContactRepository _contactRepository;

    public UpdateContactHandler(IContactRepository contactRepository)
    {
        _contactRepository = contactRepository;
    }

    public async Task<Unit> Handle(UpdateContactCommand request, CancellationToken cancellationToken)
    {
        var contact = await _contactRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Contact), request.Id);

        contact.FirstName = request.FirstName;
        contact.LastName  = request.LastName;
        contact.Email     = request.Email;
        contact.Phone     = request.Phone;
        contact.AccountId = request.AccountId;
        contact.Status    = request.Status;
        contact.UpdatedAt = DateTime.UtcNow;

        await _contactRepository.UpdateAsync(contact, cancellationToken);

        return Unit.Value;
    }
}
