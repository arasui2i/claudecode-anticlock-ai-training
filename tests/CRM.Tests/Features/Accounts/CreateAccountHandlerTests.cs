using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Accounts.CreateAccount;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Accounts;

[TestFixture]
public class CreateAccountHandlerTests
{
    private IAccountRepository _repository = null!;
    private CreateAccountHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<IAccountRepository>();
        _handler    = new CreateAccountHandler(_repository);
    }

    [Test]
    public async Task Handle_ValidCommand_CallsAddAsyncOnce()
    {
        await _handler.Handle(ValidCommand(), CancellationToken.None);

        await _repository.Received(1).AddAsync(Arg.Any<Account>(), Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_ValidCommand_ReturnsNonEmptyGuid()
    {
        var id = await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(id, Is.Not.EqualTo(Guid.Empty));
    }

    [Test]
    public async Task Handle_ValidCommand_ReturnedIdMatchesCreatedEntity()
    {
        Account? captured = null;
        await _repository.AddAsync(
            Arg.Do<Account>(a => captured = a),
            Arg.Any<CancellationToken>());

        var id = await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.That(id, Is.EqualTo(captured!.Id));
    }

    [Test]
    public async Task Handle_ValidCommand_MapsFieldsCorrectly()
    {
        var command = ValidCommand();
        Account? captured = null;
        await _repository.AddAsync(
            Arg.Do<Account>(a => captured = a),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.AccountName, Is.EqualTo(command.AccountName));
            Assert.That(captured!.Industry,    Is.EqualTo(command.Industry));
            Assert.That(captured!.Website,     Is.EqualTo(command.Website));
            Assert.That(captured!.Phone,       Is.EqualTo(command.Phone));
            Assert.That(captured!.Status,      Is.EqualTo(command.Status));
        });
    }

    [Test]
    public async Task Handle_NullOptionalFields_MapsNullsCorrectly()
    {
        var command = ValidCommand() with { Industry = null, Website = null, Phone = null };
        Account? captured = null;
        await _repository.AddAsync(
            Arg.Do<Account>(a => captured = a),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.Industry, Is.Null);
            Assert.That(captured!.Website,  Is.Null);
            Assert.That(captured!.Phone,    Is.Null);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateAccountCommand ValidCommand() => new(
        AccountName: "Acme Corp",
        Industry:    "Technology",
        Website:     "https://acme.example.com",
        Phone:       "+1-555-0100",
        Status:      AccountStatus.Active);
}
