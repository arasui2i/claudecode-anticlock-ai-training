using CRM.Application.Common;
using CRM.Domain.Entities;

namespace CRM.Application.Common.Interfaces;

public interface ITicketRepository
{
    Task<Ticket?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<Ticket>> GetPagedAsync(string? search, int page, int pageSize, CancellationToken ct = default);
    Task<string> GetNextTicketNumberAsync(CancellationToken ct = default);
    Task AddAsync(Ticket ticket, CancellationToken ct = default);
    Task UpdateAsync(Ticket ticket, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid id, CancellationToken ct = default);
}
