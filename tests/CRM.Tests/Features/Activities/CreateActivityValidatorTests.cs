using CRM.Application.Features.Activities.CreateActivity;
using CRM.Domain.Enums;
using FluentValidation.TestHelper;

namespace CRM.Tests.Features.Activities;

[TestFixture]
public class CreateActivityValidatorTests
{
    private CreateActivityValidator _validator = null!;

    [SetUp]
    public void SetUp()
    {
        _validator = new CreateActivityValidator();
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
        var command = ValidCommand() with { Subject = "Follow up call" };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Subject);
    }

    // ── DueDate ───────────────────────────────────────────────────────────────

    [Test]
    public void DueDate_Default_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { DueDate = default };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.DueDate);
    }

    [Test]
    public void DueDate_Provided_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { DueDate = new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc) };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.DueDate);
    }

    // ── Valid command ─────────────────────────────────────────────────────────

    [Test]
    public void AllRequiredFields_Provided_ShouldPassValidation()
    {
        var result = _validator.TestValidate(ValidCommand());
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateActivityCommand ValidCommand() => new(
        Subject:      "Follow up call",
        ActivityType: ActivityType.Call,
        DueDate:      new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc),
        Status:       ActivityStatus.Open,
        AssignedTo:   null);
}
