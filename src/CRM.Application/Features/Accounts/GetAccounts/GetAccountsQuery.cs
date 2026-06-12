using CRM.Application.Common;
using MediatR;

namespace CRM.Application.Features.Accounts.GetAccounts;

public record GetAccountsQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<AccountSummaryDto>>;
