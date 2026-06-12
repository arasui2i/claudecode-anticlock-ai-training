using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Contacts.GetContacts;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Contacts;

[TestFixture]
public class GetContactsHandlerTests
{
    private IContactRepository _repository = null!;
    private GetContactsHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<IContactRepository>();
        _handler    = new GetContactsHandler(_repository);
    }

    // ── Repository call ───────────────────────────────────────────────────────

    [Test]
    public async Task Handle_PassesQueryParamsToRepository()
    {
        ArrangeEmptyPage(page: 2, pageSize: 5);

        await _handler.Handle(new GetContactsQuery("jane", 2, 5), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync("jane", 2, 5, Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_NullSearch_PassesNullToRepository()
    {
        ArrangeEmptyPage();

        await _handler.Handle(new GetContactsQuery(null, 1, 10), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>());
    }

    // ── Pagination metadata ───────────────────────────────────────────────────

    [Test]
    public async Task Handle_ReturnsPageMetadataFromRepository()
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Contact> { Items = [], Total = 42, Page = 3, PageSize = 5 });

        var result = await _handler.Handle(new GetContactsQuery(null, 3, 5), CancellationToken.None);

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

        var result = await _handler.Handle(new GetContactsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Is.Empty);
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_MapsEntityFieldsToDtoCorrectly()
    {
        var contact = new Contact
        {
            FirstName = "Jane",
            LastName  = "Doe",
            Email     = "jane@example.com",
            Phone     = "555-0100",
            Status    = ContactStatus.Active,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Contact> { Items = [contact], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetContactsQuery(null, 1, 10), CancellationToken.None);

        var dto = result.Items.Single();
        Assert.Multiple(() =>
        {
            Assert.That(dto.Id,       Is.EqualTo(contact.Id));
            Assert.That(dto.FullName, Is.EqualTo("Jane Doe"));
            Assert.That(dto.Email,    Is.EqualTo("jane@example.com"));
            Assert.That(dto.Phone,    Is.EqualTo("555-0100"));
        });
    }

    [Test]
    public async Task Handle_NullLastName_FullNameHasNoTrailingSpace()
    {
        var contact = new Contact
        {
            FirstName = "Jane",
            LastName  = null,
            Email     = "jane@example.com",
            Status    = ContactStatus.Active,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Contact> { Items = [contact], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetContactsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items.Single().FullName, Is.EqualTo("Jane"));
    }

    [Test]
    public async Task Handle_NullPhone_MapsDtoPhoneAsNull()
    {
        var contact = new Contact
        {
            FirstName = "Jane",
            Email     = "jane@example.com",
            Phone     = null,
            Status    = ContactStatus.Active,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Contact> { Items = [contact], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetContactsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items.Single().Phone, Is.Null);
    }

    [Test]
    public async Task Handle_MultipleContacts_MapsAllItems()
    {
        var contacts = Enumerable.Range(1, 3).Select(i => new Contact
        {
            FirstName = $"Contact{i}",
            Email     = $"contact{i}@example.com",
            Status    = ContactStatus.Active,
        }).ToList();

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Contact> { Items = contacts, Total = 3, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetContactsQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Has.Count.EqualTo(3));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void ArrangeEmptyPage(int page = 1, int pageSize = 10)
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Contact> { Items = [], Total = 0, Page = page, PageSize = pageSize });
    }
}
