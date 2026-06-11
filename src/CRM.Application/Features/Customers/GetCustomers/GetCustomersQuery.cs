using CRM.Application.Common;
using CRM.Application.Features.Customers;
using MediatR;

namespace CRM.Application.Features.Customers.GetCustomers;

public record GetCustomersQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<CustomerSummaryDto>>;
