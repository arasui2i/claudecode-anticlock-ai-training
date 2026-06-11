using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using MediatR;

namespace CRM.Application.Features.Customers.GetCustomers;

public class GetCustomersHandler : IRequestHandler<GetCustomersQuery, PagedResult<CustomerSummaryDto>>
{
    private readonly ICustomerRepository _customerRepository;

    public GetCustomersHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<PagedResult<CustomerSummaryDto>> Handle(
        GetCustomersQuery request, CancellationToken cancellationToken)
    {
        var paged = await _customerRepository.GetPagedAsync(
            request.Search, request.Page, request.PageSize, cancellationToken);

        var dtos = paged.Items.Select(c => new CustomerSummaryDto(
            c.Id,
            c.FirstName,
            c.LastName,
            c.Company,
            c.Email,
            c.Status,
            c.JobTitle,
            c.CreatedAt)).ToList();

        return new PagedResult<CustomerSummaryDto>
        {
            Items    = dtos,
            Total    = paged.Total,
            Page     = paged.Page,
            PageSize = paged.PageSize,
        };
    }
}
