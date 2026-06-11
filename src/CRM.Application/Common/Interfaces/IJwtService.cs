using CRM.Domain.Entities;

namespace CRM.Application.Common.Interfaces;

public record JwtTokenResult(string AccessToken, DateTime ExpiresAt);

public interface IJwtService
{
    JwtTokenResult GenerateToken(User user, IEnumerable<string> roles, bool rememberMe);
}
