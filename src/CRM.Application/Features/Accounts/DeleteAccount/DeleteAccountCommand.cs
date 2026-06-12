using MediatR;

namespace CRM.Application.Features.Accounts.DeleteAccount;

public record DeleteAccountCommand(Guid Id) : IRequest<Unit>;
