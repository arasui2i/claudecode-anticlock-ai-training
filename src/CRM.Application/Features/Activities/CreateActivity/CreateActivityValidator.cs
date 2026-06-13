using FluentValidation;

namespace CRM.Application.Features.Activities.CreateActivity;

public class CreateActivityValidator : AbstractValidator<CreateActivityCommand>
{
    public CreateActivityValidator()
    {
        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required.");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required.");
    }
}
