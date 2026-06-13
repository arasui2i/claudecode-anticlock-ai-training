using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Activities.CreateActivity;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Activities;

[TestFixture]
public class CreateActivityHandlerTests
{
    private IActivityRepository _repository = null!;
    private CreateActivityHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<IActivityRepository>();
        _handler    = new CreateActivityHandler(_repository);
    }

    [Test]
    public async Task Handle_ValidCommand_CallsAddAsyncOnce()
    {
        await _handler.Handle(ValidCommand(), CancellationToken.None);

        await _repository.Received(1).AddAsync(Arg.Any<Activity>(), Arg.Any<CancellationToken>());
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
        Activity? captured = null;
        await _repository.AddAsync(
            Arg.Do<Activity>(a => captured = a),
            Arg.Any<CancellationToken>());

        var id = await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.That(id, Is.EqualTo(captured!.Id));
    }

    [Test]
    public async Task Handle_ValidCommand_MapsFieldsCorrectly()
    {
        var command = ValidCommand();
        Activity? captured = null;
        await _repository.AddAsync(
            Arg.Do<Activity>(a => captured = a),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.Subject,      Is.EqualTo(command.Subject));
            Assert.That(captured!.ActivityType, Is.EqualTo(command.ActivityType));
            Assert.That(captured!.DueDate,      Is.EqualTo(command.DueDate));
            Assert.That(captured!.Status,       Is.EqualTo(command.Status));
            Assert.That(captured!.AssignedTo,   Is.EqualTo(command.AssignedTo));
        });
    }

    [Test]
    public async Task Handle_NullAssignedTo_MapsNullCorrectly()
    {
        var command = ValidCommand() with { AssignedTo = null };
        Activity? captured = null;
        await _repository.AddAsync(
            Arg.Do<Activity>(a => captured = a),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.That(captured!.AssignedTo, Is.Null);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateActivityCommand ValidCommand() => new(
        Subject:      "Follow up call",
        ActivityType: ActivityType.Call,
        DueDate:      new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc),
        Status:       ActivityStatus.Open,
        AssignedTo:   Guid.NewGuid());
}
