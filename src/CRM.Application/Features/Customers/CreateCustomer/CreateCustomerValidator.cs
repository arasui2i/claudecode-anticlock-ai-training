using CRM.Application.Common.Interfaces;
using FluentValidation;

namespace CRM.Application.Features.Customers.CreateCustomer;

public class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
{
    public CreateCustomerValidator(ICustomerRepository customerRepository)
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MustAsync(async (email, ct) =>
                !await customerRepository.EmailExistsAsync(email, null, ct))
            .WithMessage("Email address is already in use.");
    }
}
