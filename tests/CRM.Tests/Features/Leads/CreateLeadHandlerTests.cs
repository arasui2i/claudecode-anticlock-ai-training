using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Leads.CreateLead;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Leads;

[TestFixture]
public class CreateLeadHandlerTests
{
    private ILeadRepository _repository = null!;
    private CreateLeadHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<ILeadRepository>();
        _handler    = new CreateLeadHandler(_repository);
    }

    [Test]
    public async Task Handle_ValidCommand_CallsAddAsyncOnce()
    {
        await _handler.Handle(ValidCommand(), CancellationToken.None);

        await _repository.Received(1).AddAsync(Arg.Any<Lead>(), Arg.Any<CancellationToken>());
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
        Lead? captured = null;
        await _repository.AddAsync(
            Arg.Do<Lead>(l => captured = l),
            Arg.Any<CancellationToken>());

        var id = await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.That(id, Is.EqualTo(captured!.Id));
    }

    [Test]
    public async Task Handle_ValidCommand_MapsFieldsCorrectly()
    {
        var command = ValidCommand();
        Lead? captured = null;
        await _repository.AddAsync(
            Arg.Do<Lead>(l => captured = l),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.FirstName,   Is.EqualTo(command.FirstName));
            Assert.That(captured!.LastName,    Is.EqualTo(command.LastName));
            Assert.That(captured!.CompanyName, Is.EqualTo(command.CompanyName));
            Assert.That(captured!.Email,       Is.EqualTo(command.Email));
            Assert.That(captured!.Phone,       Is.EqualTo(command.Phone));
            Assert.That(captured!.Status,      Is.EqualTo(command.Status));
            Assert.That(captured!.OwnerId,     Is.EqualTo(command.OwnerId));
        });
    }

    [Test]
    public async Task Handle_NullOptionalFields_MapsNullsCorrectly()
    {
        var command = ValidCommand() with { LastName = null, Phone = null, OwnerId = null };
        Lead? captured = null;
        await _repository.AddAsync(
            Arg.Do<Lead>(l => captured = l),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.LastName,  Is.Null);
            Assert.That(captured!.Phone,     Is.Null);
            Assert.That(captured!.OwnerId,   Is.Null);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateLeadCommand ValidCommand() => new(
        FirstName:   "Jane",
        LastName:    "Doe",
        CompanyName: "Acme Corp",
        Email:       "jane@example.com",
        Phone:       "+1-555-0100",
        Status:      LeadStatus.New,
        OwnerId:     null);
}
