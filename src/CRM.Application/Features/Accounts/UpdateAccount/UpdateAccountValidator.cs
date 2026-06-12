using FluentValidation;

namespace CRM.Application.Features.Accounts.UpdateAccount;

public class UpdateAccountValidator : AbstractValidator<UpdateAccountCommand>
{
    public UpdateAccountValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Account ID is required.");

        RuleFor(x => x.AccountName)
            .NotEmpty().WithMessage("Account name is required.");
    }
}
