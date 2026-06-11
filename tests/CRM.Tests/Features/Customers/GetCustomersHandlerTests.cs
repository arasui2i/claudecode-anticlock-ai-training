using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Customers;
using CRM.Application.Features.Customers.GetCustomers;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Customers;

[TestFixture]
public class GetCustomersHandlerTests
{
    private ICustomerRepository _repo;
    private GetCustomersHandler _handler;

    [SetUp]
    public void SetUp()
    {
        _repo    = Substitute.For<ICustomerRepository>();
        _handler = new GetCustomersHandler(_repo);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static Customer BuildCustomer(string first, string last, string email) => new()
    {
        Id        = Guid.NewGuid(),
        FirstName = first,
        LastName  = last,
        Email     = email,
        Status    = CustomerStatus.Active,
        CreatedAt = DateTime.UtcNow,
    };

    private static PagedResult<Customer> PagedOf(params Customer[] customers) => new()
    {
        Items    = [.. customers],
        Total    = customers.Length,
        Page     = 1,
        PageSize = 10,
    };

    // ── tests ─────────────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_ValidQuery_ReturnsMappedPagedResult()
    {
        var customer = BuildCustomer("Alice", "Jones", "alice@example.com");
        _repo.GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>())
             .Returns(PagedOf(customer));

        var result = await _handler.Handle(new GetCustomersQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items,    Has.Count.EqualTo(1));
        Assert.That(result.Total,    Is.EqualTo(1));
        Assert.That(result.Page,     Is.EqualTo(1));
        Assert.That(result.PageSize, Is.EqualTo(10));

        var dto = result.Items[0];
        Assert.That(dto.FirstName, Is.EqualTo("Alice"));
        Assert.That(dto.Email,     Is.EqualTo("alice@example.com"));
    }

    [Test]
    public async Task Handle_WithSearch_PassesSearchTermToRepository()
    {
        _repo.GetPagedAsync("acme", 1, 5, Arg.Any<CancellationToken>())
             .Returns(PagedOf());

        await _handler.Handle(new GetCustomersQuery("acme", 1, 5), CancellationToken.None);

        await _repo.Received(1).GetPagedAsync("acme", 1, 5, Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_EmptySearch_ReturnsAllCustomers()
    {
        var customers = new[]
        {
            BuildCustomer("Alice", "A", "a@example.com"),
            BuildCustomer("Bob",   "B", "b@example.com"),
        };
        _repo.GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>())
             .Returns(PagedOf(customers));

        var result = await _handler.Handle(new GetCustomersQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items,  Has.Count.EqualTo(2));
        Assert.That(result.Total,  Is.EqualTo(2));
        await _repo.Received(1).GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_ValidQuery_MapsAllSummaryDtoFields()
    {
        var customer = BuildCustomer("Alice", "Jones", "alice@example.com");
        customer.Company  = "ACME";
        customer.JobTitle = "Manager";
        _repo.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
             .Returns(PagedOf(customer));

        var result = await _handler.Handle(new GetCustomersQuery(), CancellationToken.None);

        var dto = result.Items[0];
        Assert.That(dto.Id,        Is.EqualTo(customer.Id));
        Assert.That(dto.LastName,  Is.EqualTo("Jones"));
        Assert.That(dto.Company,   Is.EqualTo("ACME"));
        Assert.That(dto.JobTitle,  Is.EqualTo("Manager"));
        Assert.That(dto.Status,    Is.EqualTo(CustomerStatus.Active));
        Assert.That(dto.CreatedAt, Is.EqualTo(customer.CreatedAt));
    }
}
