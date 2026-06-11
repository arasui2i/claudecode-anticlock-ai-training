using CRM.Application.Common.Interfaces;
using FluentValidation;

namespace CRM.Application.Features.Customers.UpdateCustomer;

public class UpdateCustomerValidator : AbstractValidator<UpdateCustomerCommand>
{
    public UpdateCustomerValidator(ICustomerRepository customerRepository)
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Customer ID is required.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MustAsync(async (command, email, ct) =>
                !await customerRepository.EmailExistsAsync(email, command.Id, ct))
            .WithMessage("Email address is already in use.");
    }
}
