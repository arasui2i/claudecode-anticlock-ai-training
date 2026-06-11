using CRM.Domain.Entities;

namespace CRM.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<User?> GetWithRolesAsync(Guid id, CancellationToken cancellationToken = default);
}
