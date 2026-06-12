using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Accounts.GetAccounts;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Accounts;

[TestFixture]
public class GetAccountsHandlerTests
{
    private IAccountRepository _repository = null!;
    private GetAccountsHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<IAccountRepository>();
        _handler    = new GetAccountsHandler(_repository);
    }

    // ── Repository call ───────────────────────────────────────────────────────

    [Test]
    public async Task Handle_PassesQueryParamsToRepository()
    {
        ArrangeEmptyPage(page: 2, pageSize: 5);

        await _handler.Handle(new GetAccountsQuery("acme", 2, 5), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync("acme", 2, 5, Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_NullSearch_PassesNullToRepository()
    {
        ArrangeEmptyPage();

        await _handler.Handle(new GetAccountsQuery(null, 1, 10), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>());
    }

    // ── Pagination metadata ───────────────────────────────────────────────────

    [Test]
    public async Task Handle_ReturnsPageMetadataFromRepository()
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Account> { Items = [], Total = 42, Page = 3, PageSize = 5 });

        var result = await _handler.Handle(new GetAccountsQuery(null, 3, 5), CancellationToken.None);

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

        var result = await _handler.Handle(new GetAccountsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Is.Empty);
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_MapsEntityFieldsToDtoCorrectly()
    {
        var account = new Account
        {
            AccountName = "Acme Corp",
            Industry    = "Technology",
            Phone       = "+1-555-0100",
            Status      = AccountStatus.Active,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Account> { Items = [account], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetAccountsQuery(null, 1, 10), CancellationToken.None);

        var dto = result.Items.Single();
        Assert.Multiple(() =>
        {
            Assert.That(dto.Id,          Is.EqualTo(account.Id));
            Assert.That(dto.AccountName, Is.EqualTo("Acme Corp"));
            Assert.That(dto.Industry,    Is.EqualTo("Technology"));
            Assert.That(dto.Phone,       Is.EqualTo("+1-555-0100"));
        });
    }

    [Test]
    public async Task Handle_NullOptionalFields_MapsDtoNullsCorrectly()
    {
        var account = new Account
        {
            AccountName = "Acme Corp",
            Industry    = null,
            Phone       = null,
            Status      = AccountStatus.Active,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Account> { Items = [account], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetAccountsQuery(null, 1, 10), CancellationToken.None);

        var dto = result.Items.Single();
        Assert.Multiple(() =>
        {
            Assert.That(dto.Industry, Is.Null);
            Assert.That(dto.Phone,    Is.Null);
        });
    }

    [Test]
    public async Task Handle_MultipleAccounts_MapsAllItems()
    {
        var accounts = Enumerable.Range(1, 3).Select(i => new Account
        {
            AccountName = $"Account {i}",
            Status      = AccountStatus.Active,
        }).ToList();

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Account> { Items = accounts, Total = 3, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetAccountsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Has.Count.EqualTo(3));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void ArrangeEmptyPage(int page = 1, int pageSize = 10)
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Account> { Items = [], Total = 0, Page = page, PageSize = pageSize });
    }
}
