using FluentValidation;

namespace CRM.Application.Features.Tickets.UpdateTicket;

public class UpdateTicketValidator : AbstractValidator<UpdateTicketCommand>
{
    public UpdateTicketValidator()
    {
        RuleFor(x => x.Id)
            .NotEqual(Guid.Empty).WithMessage("Ticket ID is required.");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required.");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Priority is required.");
    }
}
