using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Accounts.GetAccountById;

public class GetAccountByIdHandler : IRequestHandler<GetAccountByIdQuery, AccountDetailDto>
{
    private readonly IAccountRepository _accountRepository;

    public GetAccountByIdHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<AccountDetailDto> Handle(
        GetAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var account = await _accountRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.Id);

        return new AccountDetailDto(
            account.Id,
            account.AccountName,
            account.Industry,
            account.Website,
            account.Phone,
            account.Status,
            account.CreatedAt,
            account.UpdatedAt);
    }
}
