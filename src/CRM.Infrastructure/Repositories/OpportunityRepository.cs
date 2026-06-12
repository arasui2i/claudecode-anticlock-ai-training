using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Repositories;

public class OpportunityRepository : IOpportunityRepository
{
    private readonly AppDbContext _context;

    public OpportunityRepository(AppDbContext context) => _context = context;

    public async Task<Opportunity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Opportunities
            .AsNoTracking()
            .Include(o => o.Account)
            .Include(o => o.Contact)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<PagedResult<Opportunity>> GetPagedAsync(
        string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.Opportunities
            .AsNoTracking()
            .Include(o => o.Account);

        IQueryable<Opportunity> filtered = query;

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            filtered = query.Where(o =>
                o.OpportunityName.ToLower().Contains(term) ||
                o.Account.AccountName.ToLower().Contains(term));
        }

        var total = await filtered.CountAsync(ct);
        var items = await filtered
            .OrderBy(o => o.CloseDate == null ? 1 : 0)
            .ThenBy(o => o.CloseDate)
            .ThenByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Opportunity>
        {
            Items    = items,
            Total    = total,
            Page     = page,
            PageSize = pageSize,
        };
    }

    public async Task AddAsync(Opportunity opportunity, CancellationToken ct = default)
    {
        await _context.Opportunities.AddAsync(opportunity, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Opportunity opportunity, CancellationToken ct = default)
    {
        _context.Opportunities.Update(opportunity);
        await _context.SaveChangesAsync(ct);
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken ct = default)
    {
        var opportunity = await _context.Opportunities
            .FirstOrDefaultAsync(o => o.Id == id, ct);
        if (opportunity is null) return;

        opportunity.IsDeleted = true;
        opportunity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
}
