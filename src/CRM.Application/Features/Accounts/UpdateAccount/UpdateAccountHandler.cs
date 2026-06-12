using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Accounts.UpdateAccount;

public class UpdateAccountHandler : IRequestHandler<UpdateAccountCommand, Unit>
{
    private readonly IAccountRepository _accountRepository;

    public UpdateAccountHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<Unit> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _accountRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.Id);

        account.AccountName = request.AccountName;
        account.Industry    = request.Industry;
        account.Website     = request.Website;
        account.Phone       = request.Phone;
        account.Status      = request.Status;
        account.UpdatedAt   = DateTime.UtcNow;

        await _accountRepository.UpdateAsync(account, cancellationToken);

        return Unit.Value;
    }
}
