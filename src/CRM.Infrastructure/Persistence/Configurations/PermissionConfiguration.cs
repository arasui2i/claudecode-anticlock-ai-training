using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.Infrastructure.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    private static readonly DateTime SeedDate = new(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public static readonly Guid CustomersViewId   = new("22222222-0000-0000-0000-000000000001");
    public static readonly Guid CustomersCreateId = new("22222222-0000-0000-0000-000000000002");
    public static readonly Guid CustomersEditId   = new("22222222-0000-0000-0000-000000000003");
    public static readonly Guid CustomersDeleteId = new("22222222-0000-0000-0000-000000000004");

    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.ActionKey).IsRequired().HasMaxLength(100);
        builder.HasIndex(p => p.ActionKey).IsUnique();

        builder.HasData(
            new Permission { Id = CustomersViewId,   Name = "View Customers",   ActionKey = "customers.view",   CreatedAt = SeedDate, UpdatedAt = SeedDate },
            new Permission { Id = CustomersCreateId, Name = "Create Customers", ActionKey = "customers.create", CreatedAt = SeedDate, UpdatedAt = SeedDate },
            new Permission { Id = CustomersEditId,   Name = "Edit Customers",   ActionKey = "customers.edit",   CreatedAt = SeedDate, UpdatedAt = SeedDate },
            new Permission { Id = CustomersDeleteId, Name = "Delete Customers", ActionKey = "customers.delete", CreatedAt = SeedDate, UpdatedAt = SeedDate }
        );
    }
}
