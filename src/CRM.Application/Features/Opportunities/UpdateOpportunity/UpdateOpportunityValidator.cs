using FluentValidation;

namespace CRM.Application.Features.Opportunities.UpdateOpportunity;

public class UpdateOpportunityValidator : AbstractValidator<UpdateOpportunityCommand>
{
    public UpdateOpportunityValidator()
    {
        RuleFor(x => x.Id)
            .NotEqual(Guid.Empty).WithMessage("Opportunity ID is required.");

        RuleFor(x => x.OpportunityName)
            .NotEmpty().WithMessage("Opportunity name is required.");

        RuleFor(x => x.AccountId)
            .NotEqual(Guid.Empty).WithMessage("Account is required.");
    }
}
