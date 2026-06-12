using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Contacts.CreateContact;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Contacts;

[TestFixture]
public class CreateContactHandlerTests
{
    private IContactRepository _repository = null!;
    private CreateContactHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<IContactRepository>();
        _handler    = new CreateContactHandler(_repository);
    }

    [Test]
    public async Task Handle_ValidCommand_CallsAddAsyncOnce()
    {
        await _handler.Handle(ValidCommand(), CancellationToken.None);

        await _repository.Received(1).AddAsync(Arg.Any<Contact>(), Arg.Any<CancellationToken>());
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
        Contact? captured = null;
        await _repository.AddAsync(
            Arg.Do<Contact>(c => captured = c),
            Arg.Any<CancellationToken>());

        var id = await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.That(id, Is.EqualTo(captured!.Id));
    }

    [Test]
    public async Task Handle_ValidCommand_MapsFieldsCorrectly()
    {
        var command = ValidCommand();
        Contact? captured = null;
        await _repository.AddAsync(
            Arg.Do<Contact>(c => captured = c),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.FirstName, Is.EqualTo(command.FirstName));
            Assert.That(captured!.LastName,  Is.EqualTo(command.LastName));
            Assert.That(captured!.Email,     Is.EqualTo(command.Email));
            Assert.That(captured!.Phone,     Is.EqualTo(command.Phone));
            Assert.That(captured!.AccountId, Is.EqualTo(command.AccountId));
            Assert.That(captured!.Status,    Is.EqualTo(command.Status));
        });
    }

    [Test]
    public async Task Handle_NullOptionalFields_MapsNullsCorrectly()
    {
        var command = ValidCommand() with { LastName = null, Phone = null, AccountId = null };
        Contact? captured = null;
        await _repository.AddAsync(
            Arg.Do<Contact>(c => captured = c),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.LastName,  Is.Null);
            Assert.That(captured!.Phone,     Is.Null);
            Assert.That(captured!.AccountId, Is.Null);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateContactCommand ValidCommand() => new(
        FirstName: "Jane",
        LastName:  "Doe",
        Email:     "jane@example.com",
        Phone:     "+1-555-0100",
        AccountId: null,
        Status:    ContactStatus.Active);
}
