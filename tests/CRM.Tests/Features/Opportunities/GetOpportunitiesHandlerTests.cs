using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Opportunities.GetOpportunities;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Opportunities;

[TestFixture]
public class GetOpportunitiesHandlerTests
{
    private IOpportunityRepository _repository = null!;
    private GetOpportunitiesHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<IOpportunityRepository>();
        _handler    = new GetOpportunitiesHandler(_repository);
    }

    // ── Repository call ───────────────────────────────────────────────────────

    [Test]
    public async Task Handle_PassesQueryParamsToRepository()
    {
        ArrangeEmptyPage(page: 2, pageSize: 5);

        await _handler.Handle(new GetOpportunitiesQuery("big deal", 2, 5), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync("big deal", 2, 5, Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_NullSearch_PassesNullToRepository()
    {
        ArrangeEmptyPage();

        await _handler.Handle(new GetOpportunitiesQuery(null, 1, 10), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>());
    }

    // ── Pagination metadata ───────────────────────────────────────────────────

    [Test]
    public async Task Handle_ReturnsPageMetadataFromRepository()
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Opportunity> { Items = [], Total = 42, Page = 3, PageSize = 5 });

        var result = await _handler.Handle(new GetOpportunitiesQuery(null, 3, 5), CancellationToken.None);

        Assert.Multiple(() =>
        {
            Assert.That(result.Total,    Is.EqualTo(42));
            Assert.That(result.Page,     Is.EqualTo(3));
            Assert.That(result.PageSize, Is.EqualTo(5));
        });
    }

    [Test]
    public async Task Handle_EmptyPage_ReturnsEmptyItemsList()
    {
        ArrangeEmptyPage();

        var result = await _handler.Handle(new GetOpportunitiesQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Is.Empty);
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_MapsEntityFieldsToDtoCorrectly()
    {
        var opportunity = new Opportunity
        {
            OpportunityName = "Big Deal",
            AccountId       = Guid.NewGuid(),
            Stage           = OpportunityStage.Proposal,
            ExpectedRevenue = 50000m,
            Account         = new Account { AccountName = "Acme Corp" },
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Opportunity> { Items = [opportunity], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetOpportunitiesQuery(null, 1, 10), CancellationToken.None);

        var dto = result.Items.Single();
        Assert.Multiple(() =>
        {
            Assert.That(dto.Id,              Is.EqualTo(opportunity.Id));
            Assert.That(dto.OpportunityName, Is.EqualTo("Big Deal"));
            Assert.That(dto.AccountName,     Is.EqualTo("Acme Corp"));
            Assert.That(dto.Stage,           Is.EqualTo(OpportunityStage.Proposal));
            Assert.That(dto.ExpectedRevenue, Is.EqualTo(50000m));
        });
    }

    [Test]
    public async Task Handle_NullOptionalFields_MapsDtoNullsCorrectly()
    {
        var opportunity = new Opportunity
        {
            OpportunityName = "Small Deal",
            AccountId       = Guid.NewGuid(),
            Stage           = OpportunityStage.Prospecting,
            ExpectedRevenue = null,
            Account         = new Account { AccountName = "Globex" },
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Opportunity> { Items = [opportunity], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetOpportunitiesQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items.Single().ExpectedRevenue, Is.Null);
    }

    [Test]
    public async Task Handle_MultipleOpportunities_MapsAllItems()
    {
        var opportunities = Enumerable.Range(1, 3).Select(i => new Opportunity
        {
            OpportunityName = $"Deal {i}",
            AccountId       = Guid.NewGuid(),
            Stage           = OpportunityStage.Prospecting,
            Account         = new Account { AccountName = $"Account {i}" },
        }).ToList();

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Opportunity> { Items = opportunities, Total = 3, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetOpportunitiesQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Has.Count.EqualTo(3));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void ArrangeEmptyPage(int page = 1, int pageSize = 10)
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Opportunity> { Items = [], Total = 0, Page = page, PageSize = pageSize });
    }
}
