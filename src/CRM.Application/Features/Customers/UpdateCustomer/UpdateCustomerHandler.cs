using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Customers.UpdateCustomer;

public class UpdateCustomerHandler : IRequestHandler<UpdateCustomerCommand, Unit>
{
    private readonly ICustomerRepository _customerRepository;

    public UpdateCustomerHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<Unit> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), request.Id);

        customer.FirstName           = request.FirstName;
        customer.LastName            = request.LastName;
        customer.Company             = request.Company;
        customer.Status              = request.Status;
        customer.JobTitle            = request.JobTitle;
        customer.Gender              = request.Gender;
        customer.Age                 = request.Age;
        customer.Email               = request.Email;
        customer.PhoneNumber         = request.PhoneNumber;
        customer.Industry            = request.Industry;
        customer.AnnualIncome        = request.AnnualIncome;
        customer.EmployeeCount       = request.EmployeeCount;
        customer.HeadquartersAddress = request.HeadquartersAddress;
        customer.UpdatedAt           = DateTime.UtcNow;

        await _customerRepository.UpdateAsync(customer, cancellationToken);

        return Unit.Value;
    }
}
