using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Accounts.UpdateAccount;

public record UpdateAccountCommand(
    Guid Id,
    string AccountName,
    string? Industry,
    string? Website,
    string? Phone,
    AccountStatus Status
) : IRequest<Unit>;
