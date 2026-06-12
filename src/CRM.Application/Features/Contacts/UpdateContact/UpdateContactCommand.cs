using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Contacts.UpdateContact;

public record UpdateContactCommand(
    Guid Id,
    string FirstName,
    string? LastName,
    string Email,
    string? Phone,
    Guid? AccountId,
    ContactStatus Status
) : IRequest<Unit>;
