using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Customers.DeleteCustomer;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Customers;

[TestFixture]
public class DeleteCustomerHandlerTests
{
    private ICustomerRepository _repo;
    private DeleteCustomerHandler _handler;

    [SetUp]
    public void SetUp()
    {
        _repo    = Substitute.For<ICustomerRepository>();
        _handler = new DeleteCustomerHandler(_repo);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static Customer BuildCustomer(Guid id) => new()
    {
        Id        = id,
        FirstName = "Jane",
        LastName  = "Doe",
        Email     = "jane@example.com",
        Status    = CustomerStatus.Active,
        IsDeleted = false,
    };

    // ── tests ─────────────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_ValidId_SetsIsDeletedTrue()
    {
        var id = Guid.NewGuid();
        _repo.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(BuildCustomer(id));

        await _handler.Handle(new DeleteCustomerCommand(id), CancellationToken.None);

        await _repo.Received(1).UpdateAsync(
            Arg.Is<Customer>(c => c.IsDeleted == true),
            Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_ValidId_SetsUpdatedAtToNow()
    {
        var id     = Guid.NewGuid();
        var before = DateTime.UtcNow.AddSeconds(-1);
        _repo.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(BuildCustomer(id));

        await _handler.Handle(new DeleteCustomerCommand(id), CancellationToken.None);

        await _repo.Received(1).UpdateAsync(
            Arg.Is<Customer>(c => c.UpdatedAt >= before),
            Arg.Any<CancellationToken>());
    }

    [Test]
    public void Handle_UnknownId_ThrowsNotFoundException()
    {
        _repo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
             .Returns((Customer?)null);

        Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(new DeleteCustomerCommand(Guid.NewGuid()), CancellationToken.None));
    }
}
