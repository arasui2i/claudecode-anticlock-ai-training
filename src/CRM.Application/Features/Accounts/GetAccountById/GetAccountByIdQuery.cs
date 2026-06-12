using MediatR;

namespace CRM.Application.Features.Accounts.GetAccountById;

public record GetAccountByIdQuery(Guid Id) : IRequest<AccountDetailDto>;
