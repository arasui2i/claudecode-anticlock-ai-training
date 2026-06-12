using CRM.Application.Common;
using CRM.Domain.Entities;

namespace CRM.Application.Common.Interfaces;

public interface IOpportunityRepository
{
    Task<Opportunity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<Opportunity>> GetPagedAsync(string? search, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(Opportunity opportunity, CancellationToken ct = default);
    Task UpdateAsync(Opportunity opportunity, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid id, CancellationToken ct = default);
}
