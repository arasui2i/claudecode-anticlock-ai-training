using MediatR;

namespace CRM.Application.Features.Contacts.GetContactById;

public record GetContactByIdQuery(Guid Id) : IRequest<ContactDetailDto>;
