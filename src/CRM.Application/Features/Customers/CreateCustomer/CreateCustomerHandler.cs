using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Customers.CreateCustomer;

public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, Guid>
{
    private readonly ICustomerRepository _customerRepository;

    public CreateCustomerHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<Guid> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = new Customer
        {
            FirstName           = request.FirstName,
            LastName            = request.LastName,
            Company             = request.Company,
            Status              = request.Status,
            JobTitle            = request.JobTitle,
            Gender              = request.Gender,
            Age                 = request.Age,
            Email               = request.Email,
            PhoneNumber         = request.PhoneNumber,
            Industry            = request.Industry,
            AnnualIncome        = request.AnnualIncome,
            EmployeeCount       = request.EmployeeCount,
            HeadquartersAddress = request.HeadquartersAddress,
        };

        await _customerRepository.AddAsync(customer, cancellationToken);

        return customer.Id;
    }
}
