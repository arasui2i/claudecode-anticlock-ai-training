using CRM.Application.Common;
using CRM.Domain.Entities;

namespace CRM.Application.Common.Interfaces;

public interface IContactRepository
{
    Task<Contact?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<Contact>> GetPagedAsync(string? search, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(Contact contact, CancellationToken ct = default);
    Task UpdateAsync(Contact contact, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid id, CancellationToken ct = default);
}
