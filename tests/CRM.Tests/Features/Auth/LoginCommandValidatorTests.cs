using CRM.Application.Features.Auth.Login;

namespace CRM.Tests.Features.Auth;

[TestFixture]
public class LoginCommandValidatorTests
{
    private LoginCommandValidator _validator;

    [SetUp]
    public void SetUp() => _validator = new LoginCommandValidator();

    [Test]
    public void Validate_EmptyEmailOrUsername_ReturnsError()
    {
        var result = _validator.Validate(new LoginCommand("", "secret123", false));

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors,
            Has.One.Matches<FluentValidation.Results.ValidationFailure>(
                f => f.PropertyName == nameof(LoginCommand.EmailOrUsername)));
    }

    [Test]
    public void Validate_EmptyPassword_ReturnsError()
    {
        var result = _validator.Validate(new LoginCommand("user@test.com", "", false));

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors,
            Has.Some.Matches<FluentValidation.Results.ValidationFailure>(
                f => f.PropertyName == nameof(LoginCommand.Password)));
    }

    [Test]
    public void Validate_PasswordTooShort_ReturnsError()
    {
        var result = _validator.Validate(new LoginCommand("user@test.com", "abc", false));

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors,
            Has.One.Matches<FluentValidation.Results.ValidationFailure>(
                f => f.PropertyName == nameof(LoginCommand.Password)
                  && f.ErrorMessage.Contains("6 characters")));
    }

    [Test]
    public void Validate_ValidCommand_PassesValidation()
    {
        var result = _validator.Validate(new LoginCommand("user@test.com", "secret123", false));

        Assert.That(result.IsValid, Is.True);
        Assert.That(result.Errors, Is.Empty);
    }
}
