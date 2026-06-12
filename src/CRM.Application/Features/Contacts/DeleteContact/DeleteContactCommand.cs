using MediatR;

namespace CRM.Application.Features.Contacts.DeleteContact;

public record DeleteContactCommand(Guid Id) : IRequest<Unit>;
