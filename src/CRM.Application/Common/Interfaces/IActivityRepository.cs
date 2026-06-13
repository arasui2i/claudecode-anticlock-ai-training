using CRM.Application.Common;
using CRM.Domain.Entities;

namespace CRM.Application.Common.Interfaces;

public interface IActivityRepository
{
    Task<Activity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<Activity>> GetPagedAsync(string? search, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(Activity activity, CancellationToken ct = default);
    Task UpdateAsync(Activity activity, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid id, CancellationToken ct = default);
}
