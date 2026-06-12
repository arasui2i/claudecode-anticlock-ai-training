using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Accounts.CreateAccount;

public class CreateAccountHandler : IRequestHandler<CreateAccountCommand, Guid>
{
    private readonly IAccountRepository _accountRepository;

    public CreateAccountHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<Guid> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = new Account
        {
            AccountName = request.AccountName,
            Industry    = request.Industry,
            Website     = request.Website,
            Phone       = request.Phone,
            Status      = request.Status,
        };

        await _accountRepository.AddAsync(account, cancellationToken);

        return account.Id;
    }
}
