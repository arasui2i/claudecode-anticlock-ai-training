using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Customers.UpdateCustomer;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using FluentValidation.Results;
using NSubstitute;

namespace CRM.Tests.Features.Customers;

[TestFixture]
public class UpdateCustomerHandlerTests
{
    private ICustomerRepository _repo;
    private UpdateCustomerHandler _handler;

    [SetUp]
    public void SetUp()
    {
        _repo    = Substitute.For<ICustomerRepository>();
        _handler = new UpdateCustomerHandler(_repo);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static Customer BuildCustomer(Guid id) => new()
    {
        Id        = id,
        FirstName = "Old",
        LastName  = "Name",
        Email     = "old@example.com",
        Status    = CustomerStatus.Lead,
        IsDeleted = false,
    };

    private static UpdateCustomerCommand ValidCommand(Guid id) => new(
        id, "New", "Name", "Corp", CustomerStatus.Active,
        null, null, null,
        "new@example.com", null, null, null, null, null);

    // ── handler tests ─────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_ValidCommand_AppliesAllFieldChanges()
    {
        var id       = Guid.NewGuid();
        var customer = BuildCustomer(id);
        var command  = ValidCommand(id);

        _repo.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(customer);

        Customer? saved = null;
        await _repo.UpdateAsync(
            Arg.Do<Customer>(c => saved = c),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.That(saved, Is.Not.Null);
        Assert.That(saved!.FirstName, Is.EqualTo("New"));
        Assert.That(saved.Email,      Is.EqualTo("new@example.com"));
        Assert.That(saved.Status,     Is.EqualTo(CustomerStatus.Active));
    }

    [Test]
    public async Task Handle_ValidCommand_SetsUpdatedAt()
    {
        var id       = Guid.NewGuid();
        var before   = DateTime.UtcNow.AddSeconds(-1);
        _repo.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(BuildCustomer(id));

        await _handler.Handle(ValidCommand(id), CancellationToken.None);

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
            _handler.Handle(ValidCommand(Guid.NewGuid()), CancellationToken.None));
    }

    // ── validator tests ───────────────────────────────────────────────────────

    [Test]
    public async Task Validate_EmailBelongsToSameCustomer_PassesValidation()
    {
        var id      = Guid.NewGuid();
        var command = ValidCommand(id);
        _repo.EmailExistsAsync(command.Email, id, Arg.Any<CancellationToken>())
             .Returns(false);
        var validator = new UpdateCustomerValidator(_repo);

        var result = await validator.ValidateAsync(command);

        Assert.That(result.IsValid, Is.True);
    }

    [Test]
    public async Task Validate_EmailBelongsToOtherCustomer_ReturnsError()
    {
        var id      = Guid.NewGuid();
        var command = ValidCommand(id);
        _repo.EmailExistsAsync(command.Email, id, Arg.Any<CancellationToken>())
             .Returns(true);
        var validator = new UpdateCustomerValidator(_repo);

        var result = await validator.ValidateAsync(command);

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Matches<ValidationFailure>(
            f => f.PropertyName == nameof(UpdateCustomerCommand.Email)
              && f.ErrorMessage.Contains("already in use")));
    }
}
