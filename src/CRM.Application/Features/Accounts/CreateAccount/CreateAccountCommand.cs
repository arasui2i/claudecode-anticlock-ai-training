using CRM.Domain.Enums;
using MediatR;

namespace CRM.Application.Features.Accounts.CreateAccount;

public record CreateAccountCommand(
    string AccountName,
    string? Industry,
    string? Website,
    string? Phone,
    AccountStatus Status
) : IRequest<Guid>;
