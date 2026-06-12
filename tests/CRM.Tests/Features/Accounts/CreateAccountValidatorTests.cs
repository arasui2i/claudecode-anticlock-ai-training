using CRM.Application.Features.Accounts.CreateAccount;
using CRM.Domain.Enums;
using FluentValidation.TestHelper;

namespace CRM.Tests.Features.Accounts;

[TestFixture]
public class CreateAccountValidatorTests
{
    private CreateAccountValidator _validator = null!;

    [SetUp]
    public void SetUp()
    {
        _validator = new CreateAccountValidator();
    }

    // ── AccountName ───────────────────────────────────────────────────────────

    [Test]
    public void AccountName_Empty_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { AccountName = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.AccountName);
    }

    [Test]
    public void AccountName_Whitespace_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { AccountName = "   " };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.AccountName);
    }

    [Test]
    public void AccountName_Provided_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { AccountName = "Acme Corp" };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.AccountName);
    }

    // ── Valid command ─────────────────────────────────────────────────────────

    [Test]
    public void AllRequiredFields_Provided_ShouldPassValidation()
    {
        var result = _validator.TestValidate(ValidCommand());
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateAccountCommand ValidCommand() => new(
        AccountName: "Acme Corp",
        Industry:    null,
        Website:     null,
        Phone:       null,
        Status:      AccountStatus.Active);
}
