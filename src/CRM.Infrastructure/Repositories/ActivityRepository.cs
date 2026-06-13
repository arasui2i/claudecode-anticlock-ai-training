using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Repositories;

public class ActivityRepository : IActivityRepository
{
    private readonly AppDbContext _context;

    public ActivityRepository(AppDbContext context) => _context = context;

    public async Task<Activity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Activities
            .AsNoTracking()
            .Include(a => a.AssignedUser)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<PagedResult<Activity>> GetPagedAsync(
        string? search, int page, int pageSize, CancellationToken ct = default)
    {
        IQueryable<Activity> query = _context.Activities.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(a => a.Subject.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(a => a.DueDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Activity>
        {
            Items    = items,
            Total    = total,
            Page     = page,
            PageSize = pageSize,
        };
    }

    public async Task AddAsync(Activity activity, CancellationToken ct = default)
    {
        await _context.Activities.AddAsync(activity, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Activity activity, CancellationToken ct = default)
    {
        _context.Activities.Update(activity);
        await _context.SaveChangesAsync(ct);
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken ct = default)
    {
        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == id, ct);
        if (activity is null) return;

        activity.IsDeleted = true;
        activity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
}
