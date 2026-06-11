using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Customers.CreateCustomer;
using CRM.Domain.Enums;
using FluentValidation.Results;
using NSubstitute;

namespace CRM.Tests.Features.Customers;

[TestFixture]
public class CreateCustomerValidatorTests
{
    private ICustomerRepository _repo;
    private CreateCustomerValidator _validator;

    [SetUp]
    public void SetUp()
    {
        _repo = Substitute.For<ICustomerRepository>();
        _repo.EmailExistsAsync(Arg.Any<string>(), Arg.Any<Guid?>(), Arg.Any<CancellationToken>())
             .Returns(false);
        _validator = new CreateCustomerValidator(_repo);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static CreateCustomerCommand ValidCommand() => new(
        "Jane", "Smith", "ACME", CustomerStatus.Active,
        null, null, null,
        "jane@example.com", null, null, null, null, null);

    // ── tests ─────────────────────────────────────────────────────────────────

    [Test]
    public async Task Validate_ValidCommand_PassesValidation()
    {
        var result = await _validator.ValidateAsync(ValidCommand());

        Assert.That(result.IsValid, Is.True);
        Assert.That(result.Errors, Is.Empty);
    }

    [Test]
    public async Task Validate_EmptyFirstName_ReturnsError()
    {
        var result = await _validator.ValidateAsync(ValidCommand() with { FirstName = "" });

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.One.Matches<ValidationFailure>(
            f => f.PropertyName == nameof(CreateCustomerCommand.FirstName)));
    }

    [Test]
    public async Task Validate_EmptyLastName_ReturnsError()
    {
        var result = await _validator.ValidateAsync(ValidCommand() with { LastName = "" });

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.One.Matches<ValidationFailure>(
            f => f.PropertyName == nameof(CreateCustomerCommand.LastName)));
    }

    [Test]
    public async Task Validate_InvalidEmailFormat_ReturnsError()
    {
        var result = await _validator.ValidateAsync(ValidCommand() with { Email = "not-an-email" });

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Matches<ValidationFailure>(
            f => f.PropertyName == nameof(CreateCustomerCommand.Email)));
    }

    [Test]
    public async Task Validate_DuplicateEmail_ReturnsError()
    {
        _repo.EmailExistsAsync("jane@example.com", null, Arg.Any<CancellationToken>())
             .Returns(true);

        var result = await _validator.ValidateAsync(ValidCommand());

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.One.Matches<ValidationFailure>(
            f => f.PropertyName == nameof(CreateCustomerCommand.Email)
              && f.ErrorMessage.Contains("already in use")));
    }
}
