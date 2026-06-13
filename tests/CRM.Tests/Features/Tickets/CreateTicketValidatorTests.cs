using CRM.Application.Features.Tickets.CreateTicket;
using CRM.Domain.Enums;
using FluentValidation.TestHelper;

namespace CRM.Tests.Features.Tickets;

[TestFixture]
public class CreateTicketValidatorTests
{
    private CreateTicketValidator _validator = null!;

    [SetUp]
    public void SetUp()
    {
        _validator = new CreateTicketValidator();
    }

    // ── Subject ───────────────────────────────────────────────────────────────

    [Test]
    public void Subject_Empty_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { Subject = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Subject);
    }

    [Test]
    public void Subject_Whitespace_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { Subject = "   " };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Subject);
    }

    [Test]
    public void Subject_Provided_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { Subject = "Login page broken" };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Subject);
    }

    // ── Priority ──────────────────────────────────────────────────────────────

    [Test]
    public void Priority_InvalidEnumValue_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { Priority = (TicketPriority)99 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Priority);
    }

    [Test]
    public void Priority_ValidEnumValue_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { Priority = TicketPriority.High };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Priority);
    }

    // ── Valid command ─────────────────────────────────────────────────────────

    [Test]
    public void AllRequiredFields_Provided_ShouldPassValidation()
    {
        var result = _validator.TestValidate(ValidCommand());
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateTicketCommand ValidCommand() => new(
        Subject:   "Login page broken",
        AccountId: null,
        ContactId: null,
        Priority:  TicketPriority.Medium,
        Status:    TicketStatus.Open);
}
