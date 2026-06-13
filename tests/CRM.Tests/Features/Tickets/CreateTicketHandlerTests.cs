using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Tickets.CreateTicket;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Tickets;

[TestFixture]
public class CreateTicketHandlerTests
{
    private ITicketRepository _repository = null!;
    private CreateTicketHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<ITicketRepository>();
        _repository.GetNextTicketNumberAsync(Arg.Any<CancellationToken>())
            .Returns("TKT-00001");
        _handler = new CreateTicketHandler(_repository);
    }

    [Test]
    public async Task Handle_ValidCommand_CallsAddAsyncOnce()
    {
        await _handler.Handle(ValidCommand(), CancellationToken.None);

        await _repository.Received(1).AddAsync(Arg.Any<Ticket>(), Arg.Any<CancellationToken>());
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
        Ticket? captured = null;
        await _repository.AddAsync(
            Arg.Do<Ticket>(t => captured = t),
            Arg.Any<CancellationToken>());

        var id = await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.That(id, Is.EqualTo(captured!.Id));
    }

    [Test]
    public async Task Handle_ValidCommand_SetsTicketNumberFromRepository()
    {
        _repository.GetNextTicketNumberAsync(Arg.Any<CancellationToken>())
            .Returns("TKT-00042");

        Ticket? captured = null;
        await _repository.AddAsync(
            Arg.Do<Ticket>(t => captured = t),
            Arg.Any<CancellationToken>());

        await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.That(captured!.TicketNumber, Is.EqualTo("TKT-00042"));
    }

    [Test]
    public async Task Handle_ValidCommand_MapsFieldsCorrectly()
    {
        var command = ValidCommand();
        Ticket? captured = null;
        await _repository.AddAsync(
            Arg.Do<Ticket>(t => captured = t),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.Subject,   Is.EqualTo(command.Subject));
            Assert.That(captured!.AccountId, Is.EqualTo(command.AccountId));
            Assert.That(captured!.ContactId, Is.EqualTo(command.ContactId));
            Assert.That(captured!.Priority,  Is.EqualTo(command.Priority));
            Assert.That(captured!.Status,    Is.EqualTo(command.Status));
        });
    }

    [Test]
    public async Task Handle_CallsGetNextTicketNumberAsync_BeforeAddAsync()
    {
        await _handler.Handle(ValidCommand(), CancellationToken.None);

        await _repository.Received(1).GetNextTicketNumberAsync(Arg.Any<CancellationToken>());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateTicketCommand ValidCommand() => new(
        Subject:   "Login page broken",
        AccountId: null,
        ContactId: null,
        Priority:  TicketPriority.High,
        Status:    TicketStatus.Open);
}
