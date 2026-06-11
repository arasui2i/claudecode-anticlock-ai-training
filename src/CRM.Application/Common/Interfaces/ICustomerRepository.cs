using CRM.Application.Common;
using CRM.Domain.Entities;

namespace CRM.Application.Common.Interfaces;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<Customer>> GetPagedAsync(string? search, int page, int pageSize, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, Guid? excludeId = null, CancellationToken ct = default);
    Task AddAsync(Customer customer, CancellationToken ct = default);
    Task UpdateAsync(Customer customer, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid id, CancellationToken ct = default);
}
