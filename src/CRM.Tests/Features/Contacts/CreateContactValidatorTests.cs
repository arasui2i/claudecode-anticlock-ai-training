using CRM.Application.Features.Contacts.CreateContact;
using CRM.Domain.Enums;
using FluentValidation.TestHelper;

namespace CRM.Tests.Features.Contacts;

[TestFixture]
public class CreateContactValidatorTests
{
    private CreateContactValidator _validator = null!;

    [SetUp]
    public void SetUp()
    {
        _validator = new CreateContactValidator();
    }

    // ── FirstName ─────────────────────────────────────────────────────────────

    [Test]
    public void FirstName_Empty_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { FirstName = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Test]
    public void FirstName_Whitespace_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { FirstName = "   " };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Test]
    public void FirstName_Provided_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { FirstName = "Jane" };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.FirstName);
    }

    // ── Email ─────────────────────────────────────────────────────────────────

    [Test]
    public void Email_Empty_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { Email = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Test]
    public void Email_InvalidFormat_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { Email = "not-an-email" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Test]
    public void Email_ValidFormat_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { Email = "jane@example.com" };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Email);
    }

    // ── Valid command ─────────────────────────────────────────────────────────

    [Test]
    public void AllRequiredFields_Provided_ShouldPassValidation()
    {
        var result = _validator.TestValidate(ValidCommand());
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateContactCommand ValidCommand() => new(
        FirstName: "Jane",
        LastName:  "Doe",
        Email:     "jane@example.com",
        Phone:     null,
        AccountId: null,
        Status:    ContactStatus.Active);
}
