using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Contacts.CreateContact;

public record CreateContactCommand(
    string FirstName,
    string? LastName,
    string Email,
    string? Phone,
    Guid? AccountId,
    ContactStatus Status
) : IRequest<Guid>;
