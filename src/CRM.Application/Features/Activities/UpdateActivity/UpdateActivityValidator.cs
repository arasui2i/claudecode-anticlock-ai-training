using FluentValidation;

namespace CRM.Application.Features.Activities.UpdateActivity;

public class UpdateActivityValidator : AbstractValidator<UpdateActivityCommand>
{
    public UpdateActivityValidator()
    {
        RuleFor(x => x.Id)
            .NotEqual(Guid.Empty).WithMessage("Activity ID is required.");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required.");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required.");
    }
}
