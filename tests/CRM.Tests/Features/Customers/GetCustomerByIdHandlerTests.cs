using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Customers.GetCustomerById;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Customers;

[TestFixture]
public class GetCustomerByIdHandlerTests
{
    private ICustomerRepository _repo;
    private GetCustomerByIdHandler _handler;

    [SetUp]
    public void SetUp()
    {
        _repo    = Substitute.For<ICustomerRepository>();
        _handler = new GetCustomerByIdHandler(_repo);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static Customer BuildCustomer(Guid id) => new()
    {
        Id                  = id,
        FirstName           = "Jane",
        LastName            = "Doe",
        Company             = "ACME",
        Status              = CustomerStatus.Active,
        JobTitle            = "Engineer",
        Gender              = Gender.Female,
        Age                 = 30,
        Email               = "jane@example.com",
        PhoneNumber         = "555-0100",
        Industry            = "Tech",
        AnnualIncome        = 90_000m,
        EmployeeCount       = 200,
        HeadquartersAddress = "1 Main St",
        CreatedAt           = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        UpdatedAt           = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
    };

    // ── tests ─────────────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_ValidId_ReturnsCorrectCustomerDetailDto()
    {
        var id       = Guid.NewGuid();
        var customer = BuildCustomer(id);
        _repo.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(customer);

        var dto = await _handler.Handle(new GetCustomerByIdQuery(id), CancellationToken.None);

        Assert.That(dto.Id,                  Is.EqualTo(customer.Id));
        Assert.That(dto.FirstName,           Is.EqualTo("Jane"));
        Assert.That(dto.LastName,            Is.EqualTo("Doe"));
        Assert.That(dto.Company,             Is.EqualTo("ACME"));
        Assert.That(dto.Status,              Is.EqualTo(CustomerStatus.Active));
        Assert.That(dto.JobTitle,            Is.EqualTo("Engineer"));
        Assert.That(dto.Gender,              Is.EqualTo(Gender.Female));
        Assert.That(dto.Age,                 Is.EqualTo(30));
        Assert.That(dto.Email,               Is.EqualTo("jane@example.com"));
        Assert.That(dto.PhoneNumber,         Is.EqualTo("555-0100"));
        Assert.That(dto.Industry,            Is.EqualTo("Tech"));
        Assert.That(dto.AnnualIncome,        Is.EqualTo(90_000m));
        Assert.That(dto.EmployeeCount,       Is.EqualTo(200));
        Assert.That(dto.HeadquartersAddress, Is.EqualTo("1 Main St"));
        Assert.That(dto.CreatedAt,           Is.EqualTo(customer.CreatedAt));
        Assert.That(dto.UpdatedAt,           Is.EqualTo(customer.UpdatedAt));
    }

    [Test]
    public void Handle_UnknownId_ThrowsNotFoundException()
    {
        _repo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
             .Returns((Customer?)null);

        Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(new GetCustomerByIdQuery(Guid.NewGuid()), CancellationToken.None));
    }
}
