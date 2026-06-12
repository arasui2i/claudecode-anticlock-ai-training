using CRM.Application.Features.Opportunities.CreateOpportunity;
using CRM.Domain.Enums;
using FluentValidation.TestHelper;

namespace CRM.Tests.Features.Opportunities;

[TestFixture]
public class CreateOpportunityValidatorTests
{
    private CreateOpportunityValidator _validator = null!;

    [SetUp]
    public void SetUp()
    {
        _validator = new CreateOpportunityValidator();
    }

    // ── OpportunityName ───────────────────────────────────────────────────────

    [Test]
    public void OpportunityName_Empty_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { OpportunityName = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.OpportunityName);
    }

    [Test]
    public void OpportunityName_Whitespace_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { OpportunityName = "   " };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.OpportunityName);
    }

    [Test]
    public void OpportunityName_Provided_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { OpportunityName = "Big Deal" };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.OpportunityName);
    }

    // ── AccountId ─────────────────────────────────────────────────────────────

    [Test]
    public void AccountId_EmptyGuid_ShouldHaveValidationError()
    {
        var command = ValidCommand() with { AccountId = Guid.Empty };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.AccountId);
    }

    [Test]
    public void AccountId_ValidGuid_ShouldNotHaveValidationError()
    {
        var command = ValidCommand() with { AccountId = Guid.NewGuid() };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.AccountId);
    }

    // ── Valid command ─────────────────────────────────────────────────────────

    [Test]
    public void AllRequiredFields_Provided_ShouldPassValidation()
    {
        var result = _validator.TestValidate(ValidCommand());
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateOpportunityCommand ValidCommand() => new(
        OpportunityName: "Big Deal",
        AccountId:       Guid.NewGuid(),
        ContactId:       null,
        Stage:           OpportunityStage.Prospecting,
        ExpectedRevenue: null,
        CloseDate:       null);
}
