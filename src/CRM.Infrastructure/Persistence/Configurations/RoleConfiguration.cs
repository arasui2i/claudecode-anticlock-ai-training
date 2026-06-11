using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    private static readonly Guid AdminId = new("11111111-0000-0000-0000-000000000001");
    private static readonly Guid SalesId = new("11111111-0000-0000-0000-000000000002");
    private static readonly Guid ViewerId = new("11111111-0000-0000-0000-000000000003");

    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(r => r.Name).IsUnique();

        builder.HasData(
            new Role { Id = AdminId,  Name = "Admin",  CreatedAt = SeedDate, UpdatedAt = SeedDate },
            new Role { Id = SalesId,  Name = "Sales",  CreatedAt = SeedDate, UpdatedAt = SeedDate },
            new Role { Id = ViewerId, Name = "Viewer", CreatedAt = SeedDate, UpdatedAt = SeedDate }
        );
    }

    private static readonly DateTime SeedDate = new(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public static Guid GetAdminId()   => AdminId;
    public static Guid GetSalesId()   => SalesId;
    public static Guid GetViewerId()  => ViewerId;
}
