using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using MediatR;

namespace CRM.Application.Features.Accounts.GetAccounts;

public class GetAccountsHandler : IRequestHandler<GetAccountsQuery, PagedResult<AccountSummaryDto>>
{
    private readonly IAccountRepository _accountRepository;

    public GetAccountsHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<PagedResult<AccountSummaryDto>> Handle(
        GetAccountsQuery request, CancellationToken cancellationToken)
    {
        var paged = await _accountRepository.GetPagedAsync(
            request.Search, request.Page, request.PageSize, cancellationToken);

        var dtos = paged.Items.Select(a => new AccountSummaryDto(
            a.Id,
            a.AccountName,
            a.Industry,
            a.Phone)).ToList();

        return new PagedResult<AccountSummaryDto>
        {
            Items    = dtos,
            Total    = paged.Total,
            Page     = paged.Page,
            PageSize = paged.PageSize,
        };
    }
}
