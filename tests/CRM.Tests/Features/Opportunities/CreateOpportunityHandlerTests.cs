using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Opportunities.CreateOpportunity;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Opportunities;

[TestFixture]
public class CreateOpportunityHandlerTests
{
    private IOpportunityRepository _repository = null!;
    private CreateOpportunityHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<IOpportunityRepository>();
        _handler    = new CreateOpportunityHandler(_repository);
    }

    [Test]
    public async Task Handle_ValidCommand_CallsAddAsyncOnce()
    {
        await _handler.Handle(ValidCommand(), CancellationToken.None);

        await _repository.Received(1).AddAsync(Arg.Any<Opportunity>(), Arg.Any<CancellationToken>());
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
        Opportunity? captured = null;
        await _repository.AddAsync(
            Arg.Do<Opportunity>(o => captured = o),
            Arg.Any<CancellationToken>());

        var id = await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.That(id, Is.EqualTo(captured!.Id));
    }

    [Test]
    public async Task Handle_ValidCommand_MapsFieldsCorrectly()
    {
        var command = ValidCommand();
        Opportunity? captured = null;
        await _repository.AddAsync(
            Arg.Do<Opportunity>(o => captured = o),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.OpportunityName, Is.EqualTo(command.OpportunityName));
            Assert.That(captured!.AccountId,       Is.EqualTo(command.AccountId));
            Assert.That(captured!.ContactId,       Is.EqualTo(command.ContactId));
            Assert.That(captured!.Stage,           Is.EqualTo(command.Stage));
            Assert.That(captured!.ExpectedRevenue, Is.EqualTo(command.ExpectedRevenue));
            Assert.That(captured!.CloseDate,       Is.EqualTo(command.CloseDate));
        });
    }

    [Test]
    public async Task Handle_NullOptionalFields_MapsNullsCorrectly()
    {
        var command = ValidCommand() with { ContactId = null, ExpectedRevenue = null, CloseDate = null };
        Opportunity? captured = null;
        await _repository.AddAsync(
            Arg.Do<Opportunity>(o => captured = o),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(captured, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(captured!.ContactId,       Is.Null);
            Assert.That(captured!.ExpectedRevenue, Is.Null);
            Assert.That(captured!.CloseDate,       Is.Null);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static CreateOpportunityCommand ValidCommand() => new(
        OpportunityName: "Big Deal",
        AccountId:       Guid.NewGuid(),
        ContactId:       Guid.NewGuid(),
        Stage:           OpportunityStage.Proposal,
        ExpectedRevenue: 50000m,
        CloseDate:       new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc));
}
