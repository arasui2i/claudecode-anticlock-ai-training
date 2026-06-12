using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Contacts.DeleteContact;

public class DeleteContactHandler : IRequestHandler<DeleteContactCommand, Unit>
{
    private readonly IContactRepository _contactRepository;

    public DeleteContactHandler(IContactRepository contactRepository)
    {
        _contactRepository = contactRepository;
    }

    public async Task<Unit> Handle(DeleteContactCommand request, CancellationToken cancellationToken)
    {
        var contact = await _contactRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Contact), request.Id);

        contact.IsDeleted = true;
        contact.UpdatedAt = DateTime.UtcNow;

        await _contactRepository.UpdateAsync(contact, cancellationToken);

        return Unit.Value;
    }
}
