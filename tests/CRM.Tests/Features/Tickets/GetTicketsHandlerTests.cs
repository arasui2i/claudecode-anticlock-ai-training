using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Tickets.GetTickets;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Tickets;

[TestFixture]
public class GetTicketsHandlerTests
{
    private ITicketRepository _repository = null!;
    private GetTicketsHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<ITicketRepository>();
        _handler    = new GetTicketsHandler(_repository);
    }

    // ── Repository call ───────────────────────────────────────────────────────

    [Test]
    public async Task Handle_PassesQueryParamsToRepository()
    {
        ArrangeEmptyPage(page: 2, pageSize: 5);

        await _handler.Handle(new GetTicketsQuery("login", 2, 5), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync("login", 2, 5, Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_NullSearch_PassesNullToRepository()
    {
        ArrangeEmptyPage();

        await _handler.Handle(new GetTicketsQuery(null, 1, 10), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>());
    }

    // ── Pagination metadata ───────────────────────────────────────────────────

    [Test]
    public async Task Handle_ReturnsPageMetadataFromRepository()
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Ticket> { Items = [], Total = 42, Page = 3, PageSize = 5 });

        var result = await _handler.Handle(new GetTicketsQuery(null, 3, 5), CancellationToken.None);

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

        var result = await _handler.Handle(new GetTicketsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Is.Empty);
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_MapsEntityFieldsToDtoCorrectly()
    {
        var ticket = new Ticket
        {
            TicketNumber = "TKT-00001",
            Subject      = "Login page broken",
            Priority     = TicketPriority.High,
            Status       = TicketStatus.Open,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Ticket> { Items = [ticket], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetTicketsQuery(null, 1, 10), CancellationToken.None);

        var dto = result.Items.Single();
        Assert.Multiple(() =>
        {
            Assert.That(dto.Id,           Is.EqualTo(ticket.Id));
            Assert.That(dto.TicketNumber, Is.EqualTo("TKT-00001"));
            Assert.That(dto.Subject,      Is.EqualTo("Login page broken"));
            Assert.That(dto.Priority,     Is.EqualTo(TicketPriority.High));
            Assert.That(dto.Status,       Is.EqualTo(TicketStatus.Open));
        });
    }

    [Test]
    public async Task Handle_MultipleTickets_MapsAllItems()
    {
        var tickets = Enumerable.Range(1, 3).Select(i => new Ticket
        {
            TicketNumber = $"TKT-{i:D5}",
            Subject      = $"Issue {i}",
            Priority     = TicketPriority.Medium,
            Status       = TicketStatus.Open,
        }).ToList();

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Ticket> { Items = tickets, Total = 3, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetTicketsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Has.Count.EqualTo(3));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void ArrangeEmptyPage(int page = 1, int pageSize = 10)
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Ticket> { Items = [], Total = 0, Page = page, PageSize = pageSize });
    }
}
