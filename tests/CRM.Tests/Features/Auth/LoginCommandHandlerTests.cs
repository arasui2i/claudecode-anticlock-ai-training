using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Auth.Login;
using CRM.Domain.Entities;
using NSubstitute;

namespace CRM.Tests.Features.Auth;

[TestFixture]
public class LoginCommandHandlerTests
{
    private IUserRepository _userRepository;
    private IJwtService _jwtService;
    private IPasswordHasher _passwordHasher;
    private LoginCommandHandler _handler;

    [SetUp]
    public void SetUp()
    {
        _userRepository  = Substitute.For<IUserRepository>();
        _jwtService      = Substitute.For<IJwtService>();
        _passwordHasher  = Substitute.For<IPasswordHasher>();
        _handler         = new LoginCommandHandler(_userRepository, _jwtService, _passwordHasher);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static User BuildUser(Guid? id = null) => new()
    {
        Id           = id ?? Guid.NewGuid(),
        Email        = "user@test.com",
        Username     = "testuser",
        PasswordHash = "hashed_password",
        IsActive     = true
    };

    private static User BuildUserWithRoles(Guid userId, params string[] roleNames)
    {
        var user = BuildUser(userId);
        foreach (var name in roleNames)
        {
            var role = new Role { Id = Guid.NewGuid(), Name = name };
            user.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id, User = user, Role = role });
        }
        return user;
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    [Test]
    public async Task Handle_ValidEmail_ReturnsLoginResult()
    {
        var userId       = Guid.NewGuid();
        var user         = BuildUser(userId);
        var userWithRole = BuildUserWithRoles(userId, "Admin");
        var expiry       = DateTime.UtcNow.AddHours(1);

        _userRepository.GetByEmailAsync(user.Email, Arg.Any<CancellationToken>()).Returns(user);
        _userRepository.GetWithRolesAsync(userId, Arg.Any<CancellationToken>()).Returns(userWithRole);
        _passwordHasher.Verify("secret123", user.PasswordHash).Returns(true);
        _jwtService.GenerateToken(user, Arg.Any<IEnumerable<string>>(), false)
            .Returns(new JwtTokenResult("jwt_token", expiry));

        var result = await _handler.Handle(
            new LoginCommand(user.Email, "secret123", false), CancellationToken.None);

        Assert.That(result.AccessToken, Is.EqualTo("jwt_token"));
        Assert.That(result.ExpiresAt,   Is.EqualTo(expiry));
        Assert.That(result.User.Email,  Is.EqualTo(user.Email));
        Assert.That(result.User.Roles,  Contains.Item("Admin"));
    }

    [Test]
    public async Task Handle_ValidUsername_FallsBackToUsernameSearch()
    {
        var userId       = Guid.NewGuid();
        var user         = BuildUser(userId);
        var userWithRole = BuildUserWithRoles(userId, "Sales");

        // email lookup returns nothing — handler must try username next
        _userRepository.GetByEmailAsync("testuser", Arg.Any<CancellationToken>()).Returns((User?)null);
        _userRepository.GetByUsernameAsync("testuser", Arg.Any<CancellationToken>()).Returns(user);
        _userRepository.GetWithRolesAsync(userId, Arg.Any<CancellationToken>()).Returns(userWithRole);
        _passwordHasher.Verify("secret123", user.PasswordHash).Returns(true);
        _jwtService.GenerateToken(user, Arg.Any<IEnumerable<string>>(), false)
            .Returns(new JwtTokenResult("jwt_token", DateTime.UtcNow.AddHours(1)));

        var result = await _handler.Handle(
            new LoginCommand("testuser", "secret123", false), CancellationToken.None);

        Assert.That(result.AccessToken, Is.Not.Null);
        Assert.That(result.User.Username, Is.EqualTo(user.Username));
    }

    [Test]
    public void Handle_WrongPassword_ThrowsUnauthorizedException()
    {
        var user = BuildUser();

        _userRepository.GetByEmailAsync(user.Email, Arg.Any<CancellationToken>()).Returns(user);
        _passwordHasher.Verify("wrong_password", user.PasswordHash).Returns(false);

        Assert.ThrowsAsync<UnauthorizedException>(() =>
            _handler.Handle(new LoginCommand(user.Email, "wrong_password", false), CancellationToken.None));
    }

    [Test]
    public void Handle_UnknownUser_ThrowsUnauthorizedException()
    {
        _userRepository.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);
        _userRepository.GetByUsernameAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);

        Assert.ThrowsAsync<UnauthorizedException>(() =>
            _handler.Handle(new LoginCommand("nobody@test.com", "secret123", false), CancellationToken.None));
    }

    [Test]
    public async Task Handle_RememberMe_ExpiryIsLaterThanDefaultLogin()
    {
        var userId       = Guid.NewGuid();
        var user         = BuildUser(userId);
        var userWithRole = BuildUserWithRoles(userId, "Viewer");
        var shortExpiry  = DateTime.UtcNow.AddMinutes(60);
        var longExpiry   = DateTime.UtcNow.AddDays(7);

        _userRepository.GetByEmailAsync(user.Email, Arg.Any<CancellationToken>()).Returns(user);
        _userRepository.GetWithRolesAsync(userId, Arg.Any<CancellationToken>()).Returns(userWithRole);
        _passwordHasher.Verify(Arg.Any<string>(), Arg.Any<string>()).Returns(true);

        _jwtService.GenerateToken(user, Arg.Any<IEnumerable<string>>(), false)
            .Returns(new JwtTokenResult("token", shortExpiry));
        _jwtService.GenerateToken(user, Arg.Any<IEnumerable<string>>(), true)
            .Returns(new JwtTokenResult("token", longExpiry));

        var normalResult     = await _handler.Handle(new LoginCommand(user.Email, "pass", false), CancellationToken.None);
        var rememberMeResult = await _handler.Handle(new LoginCommand(user.Email, "pass", true), CancellationToken.None);

        Assert.That(rememberMeResult.ExpiresAt, Is.GreaterThan(normalResult.ExpiresAt));
    }
}
