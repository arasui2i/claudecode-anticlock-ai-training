using FluentValidation;

namespace CRM.Application.Features.Tickets.CreateTicket;

public class CreateTicketValidator : AbstractValidator<CreateTicketCommand>
{
    public CreateTicketValidator()
    {
        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required.");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Priority is required.");
    }
}
