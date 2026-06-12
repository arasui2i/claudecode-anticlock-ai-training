using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Leads.GetLeads;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Leads;

[TestFixture]
public class GetLeadsHandlerTests
{
    private ILeadRepository _repository = null!;
    private GetLeadsHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<ILeadRepository>();
        _handler    = new GetLeadsHandler(_repository);
    }

    // ── Repository call ───────────────────────────────────────────────────────

    [Test]
    public async Task Handle_PassesQueryParamsToRepository()
    {
        ArrangeEmptyPage(page: 2, pageSize: 5);

        await _handler.Handle(new GetLeadsQuery("acme", 2, 5), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync("acme", 2, 5, Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_NullSearch_PassesNullToRepository()
    {
        ArrangeEmptyPage();

        await _handler.Handle(new GetLeadsQuery(null, 1, 10), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>());
    }

    // ── Pagination metadata ───────────────────────────────────────────────────

    [Test]
    public async Task Handle_ReturnsPageMetadataFromRepository()
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Lead> { Items = [], Total = 42, Page = 3, PageSize = 5 });

        var result = await _handler.Handle(new GetLeadsQuery(null, 3, 5), CancellationToken.None);

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

        var result = await _handler.Handle(new GetLeadsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Is.Empty);
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_MapsEntityFieldsToDtoCorrectly()
    {
        var lead = new Lead
        {
            FirstName   = "Jane",
            LastName    = "Doe",
            CompanyName = "Acme Corp",
            Email       = "jane@example.com",
            Status      = LeadStatus.Qualified,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Lead> { Items = [lead], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetLeadsQuery(null, 1, 10), CancellationToken.None);

        var dto = result.Items.Single();
        Assert.Multiple(() =>
        {
            Assert.That(dto.Id,          Is.EqualTo(lead.Id));
            Assert.That(dto.FullName,    Is.EqualTo("Jane Doe"));
            Assert.That(dto.CompanyName, Is.EqualTo("Acme Corp"));
            Assert.That(dto.Email,       Is.EqualTo("jane@example.com"));
            Assert.That(dto.Status,      Is.EqualTo(LeadStatus.Qualified));
        });
    }

    [Test]
    public async Task Handle_NullLastName_FullNameHasNoTrailingSpace()
    {
        var lead = new Lead
        {
            FirstName   = "Jane",
            LastName    = null,
            CompanyName = "Acme Corp",
            Email       = "jane@example.com",
            Status      = LeadStatus.New,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Lead> { Items = [lead], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetLeadsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items.Single().FullName, Is.EqualTo("Jane"));
    }

    [Test]
    public async Task Handle_MultipleLeads_MapsAllItems()
    {
        var leads = Enumerable.Range(1, 3).Select(i => new Lead
        {
            FirstName   = $"Lead{i}",
            CompanyName = $"Company{i}",
            Email       = $"lead{i}@example.com",
            Status      = LeadStatus.New,
        }).ToList();

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Lead> { Items = leads, Total = 3, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetLeadsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Has.Count.EqualTo(3));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void ArrangeEmptyPage(int page = 1, int pageSize = 10)
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Lead> { Items = [], Total = 0, Page = page, PageSize = pageSize });
    }
}
