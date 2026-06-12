using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        await context.Database.MigrateAsync();

        if (await context.Users.AnyAsync())
            return;

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@crm.local",
            Username = "admin",
            PasswordHash = passwordHasher.Hash("Admin@1234"),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        context.Users.Add(adminUser);

        context.UserRoles.Add(new UserRole
        {
            UserId = adminUser.Id,
            RoleId = RoleConfiguration.GetAdminId(),
        });

        await context.SaveChangesAsync();
    }
}
