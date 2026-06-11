using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using MediatR;

namespace CRM.Application.Features.Auth.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginCommandResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IJwtService jwtService,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginCommandResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.EmailOrUsername, cancellationToken)
                ?? await _userRepository.GetByUsernameAsync(request.EmailOrUsername, cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        var userWithRoles = await _userRepository.GetWithRolesAsync(user.Id, cancellationToken);
        var roles = userWithRoles?.UserRoles.Select(ur => ur.Role.Name).ToList() ?? [];

        var token = _jwtService.GenerateToken(user, roles, request.RememberMe);

        return new LoginCommandResult(
            token.AccessToken,
            token.ExpiresAt,
            new LoginUserDto(user.Id, user.Email, user.Username, roles));
    }
}
