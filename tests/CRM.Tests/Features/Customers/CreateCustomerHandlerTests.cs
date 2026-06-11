using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Customers.CreateCustomer;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Customers;

[TestFixture]
public class CreateCustomerHandlerTests
{
    private ICustomerRepository _repo;
    private CreateCustomerHandler _handler;

    [SetUp]
    public void SetUp()
    {
        _repo    = Substitute.For<ICustomerRepository>();
        _handler = new CreateCustomerHandler(_repo);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static CreateCustomerCommand ValidCommand() => new(
        "Jane", "Smith", "ACME", CustomerStatus.Active,
        "Engineer", Gender.Female, 30,
        "jane@example.com", "555-0100", "Tech",
        80_000m, 50, "1 Main St");

    // ── tests ─────────────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_ValidCommand_ReturnsNewCustomerId()
    {
        var id = await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(id, Is.Not.EqualTo(Guid.Empty));
        await _repo.Received(1).AddAsync(
            Arg.Is<Customer>(c => c.Email == "jane@example.com"),
            Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_ValidCommand_BuildsEntityFromAllFields()
    {
        Customer? saved = null;
        await _repo.AddAsync(
            Arg.Do<Customer>(c => saved = c),
            Arg.Any<CancellationToken>());

        await _handler.Handle(ValidCommand(), CancellationToken.None);

        Assert.That(saved, Is.Not.Null);
        Assert.That(saved!.FirstName,    Is.EqualTo("Jane"));
        Assert.That(saved.LastName,      Is.EqualTo("Smith"));
        Assert.That(saved.Email,         Is.EqualTo("jane@example.com"));
        Assert.That(saved.Status,        Is.EqualTo(CustomerStatus.Active));
        Assert.That(saved.IsDeleted,     Is.False);
    }
}
