using CRM.Application.Features.Leads.CreateLead;
using CRM.Domain.Enums;
using FluentValidation.TestHelper;

namespace CRM.Tests.Features.Leads;

[TestFixture]
public class CreateLeadValidatorTests
{
    private CreateLeadValidator _validator = null!;

    [SetUp]
    public void SetUp()
    {
        _validator = new CreateLeadValidator();
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

    // ── CompanyName ───────────────────────────────────────────────────────────

    [Test]
    public void CompanyName_Empty_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { CompanyName = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CompanyName);
    }

    [Test]
    public void CompanyName_Whitespace_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { CompanyName = "   " };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CompanyName);
    }

    [Test]
    public void CompanyName_Provided_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { CompanyName = "Acme Corp" };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.CompanyName);
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

    private static CreateLeadCommand ValidCommand() => new(
        FirstName:   "Jane",
        LastName:    "Doe",
        CompanyName: "Acme Corp",
        Email:       "jane@example.com",
        Phone:       null,
        Status:      LeadStatus.New,
        OwnerId:     null);
}
