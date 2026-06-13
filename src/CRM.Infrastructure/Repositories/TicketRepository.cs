using CRM.Application.Common;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly AppDbContext _context;

    public TicketRepository(AppDbContext context) => _context = context;

    public async Task<Ticket?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Tickets
            .AsNoTracking()
            .Include(t => t.Account)
            .Include(t => t.Contact)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<PagedResult<Ticket>> GetPagedAsync(
        string? search, int page, int pageSize, CancellationToken ct = default)
    {
        IQueryable<Ticket> query = _context.Tickets.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(t =>
                t.TicketNumber.ToLower().Contains(term) ||
                t.Subject.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Ticket>
        {
            Items    = items,
            Total    = total,
            Page     = page,
            PageSize = pageSize,
        };
    }

    public async Task<string> GetNextTicketNumberAsync(CancellationToken ct = default)
    {
        var count = await _context.Tickets
            .IgnoreQueryFilters()
            .CountAsync(ct);

        return $"TKT-{(count + 1):D5}";
    }

    public async Task AddAsync(Ticket ticket, CancellationToken ct = default)
    {
        await _context.Tickets.AddAsync(ticket, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Ticket ticket, CancellationToken ct = default)
    {
        _context.Tickets.Update(ticket);
        await _context.SaveChangesAsync(ct);
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken ct = default)
    {
        var ticket = await _context.Tickets
            .FirstOrDefaultAsync(t => t.Id == id, ct);
        if (ticket is null) return;

        ticket.IsDeleted = true;
        ticket.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
}
