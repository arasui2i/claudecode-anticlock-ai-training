using FluentValidation;

namespace CRM.Application.Features.Opportunities.CreateOpportunity;

public class CreateOpportunityValidator : AbstractValidator<CreateOpportunityCommand>
{
    public CreateOpportunityValidator()
    {
        RuleFor(x => x.OpportunityName)
            .NotEmpty().WithMessage("Opportunity name is required.");

        RuleFor(x => x.AccountId)
            .NotEqual(Guid.Empty).WithMessage("Account is required.");
    }
}
