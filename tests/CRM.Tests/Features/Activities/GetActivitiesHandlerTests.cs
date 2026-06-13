using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Activities.GetActivities;
using CRM.Domain.Entities;
using CRM.Domain.Enums;
using NSubstitute;

namespace CRM.Tests.Features.Activities;

[TestFixture]
public class GetActivitiesHandlerTests
{
    private IActivityRepository _repository = null!;
    private GetActivitiesHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = Substitute.For<IActivityRepository>();
        _handler    = new GetActivitiesHandler(_repository);
    }

    // ── Repository call ───────────────────────────────────────────────────────

    [Test]
    public async Task Handle_PassesQueryParamsToRepository()
    {
        ArrangeEmptyPage(page: 2, pageSize: 5);

        await _handler.Handle(new GetActivitiesQuery("follow up", 2, 5), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync("follow up", 2, 5, Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_NullSearch_PassesNullToRepository()
    {
        ArrangeEmptyPage();

        await _handler.Handle(new GetActivitiesQuery(null, 1, 10), CancellationToken.None);

        await _repository.Received(1).GetPagedAsync(null, 1, 10, Arg.Any<CancellationToken>());
    }

    // ── Pagination metadata ───────────────────────────────────────────────────

    [Test]
    public async Task Handle_ReturnsPageMetadataFromRepository()
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Activity> { Items = [], Total = 42, Page = 3, PageSize = 5 });

        var result = await _handler.Handle(new GetActivitiesQuery(null, 3, 5), CancellationToken.None);

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

        var result = await _handler.Handle(new GetActivitiesQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Is.Empty);
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_MapsEntityFieldsToDtoCorrectly()
    {
        var dueDate = new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc);
        var activity = new Activity
        {
            Subject      = "Follow up call",
            ActivityType = ActivityType.Call,
            DueDate      = dueDate,
            Status       = ActivityStatus.Open,
        };

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Activity> { Items = [activity], Total = 1, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetActivitiesQuery(null, 1, 10), CancellationToken.None);

        var dto = result.Items.Single();
        Assert.Multiple(() =>
        {
            Assert.That(dto.Id,           Is.EqualTo(activity.Id));
            Assert.That(dto.Subject,      Is.EqualTo("Follow up call"));
            Assert.That(dto.ActivityType, Is.EqualTo(ActivityType.Call));
            Assert.That(dto.DueDate,      Is.EqualTo(dueDate));
            Assert.That(dto.Status,       Is.EqualTo(ActivityStatus.Open));
        });
    }

    [Test]
    public async Task Handle_MultipleActivities_MapsAllItems()
    {
        var activities = Enumerable.Range(1, 3).Select(i => new Activity
        {
            Subject      = $"Task {i}",
            ActivityType = ActivityType.Task,
            DueDate      = new DateTime(2026, 12, i, 0, 0, 0, DateTimeKind.Utc),
            Status       = ActivityStatus.Open,
        }).ToList();

        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Activity> { Items = activities, Total = 3, Page = 1, PageSize = 10 });

        var result = await _handler.Handle(new GetActivitiesQuery(null, 1, 10), CancellationToken.None);

        Assert.That(result.Items, Has.Count.EqualTo(3));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void ArrangeEmptyPage(int page = 1, int pageSize = 10)
    {
        _repository.GetPagedAsync(Arg.Any<string?>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Activity> { Items = [], Total = 0, Page = page, PageSize = pageSize });
    }
}
