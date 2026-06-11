using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Customers.GetCustomerById;

public class GetCustomerByIdHandler : IRequestHandler<GetCustomerByIdQuery, CustomerDetailDto>
{
    private readonly ICustomerRepository _customerRepository;

    public GetCustomerByIdHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<CustomerDetailDto> Handle(
        GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), request.Id);

        return new CustomerDetailDto(
            customer.Id,
            customer.FirstName,
            customer.LastName,
            customer.Company,
            customer.Status,
            customer.JobTitle,
            customer.Gender,
            customer.Age,
            customer.Email,
            customer.PhoneNumber,
            customer.Industry,
            customer.AnnualIncome,
            customer.EmployeeCount,
            customer.HeadquartersAddress,
            customer.CreatedAt,
            customer.UpdatedAt);
    }
}
