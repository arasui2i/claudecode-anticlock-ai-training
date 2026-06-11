using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.Infrastructure.Persistence.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    private static readonly DateTime SeedDate = new(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.HasKey(rp => new { rp.RoleId, rp.PermissionId });

        builder.HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Admin gets all permissions
        var adminId = RoleConfiguration.GetAdminId();
        builder.HasData(
            new RolePermission { RoleId = adminId, PermissionId = PermissionConfiguration.CustomersViewId },
            new RolePermission { RoleId = adminId, PermissionId = PermissionConfiguration.CustomersCreateId },
            new RolePermission { RoleId = adminId, PermissionId = PermissionConfiguration.CustomersEditId },
            new RolePermission { RoleId = adminId, PermissionId = PermissionConfiguration.CustomersDeleteId },
            // Sales gets view, create, edit
            new RolePermission { RoleId = RoleConfiguration.GetSalesId(), PermissionId = PermissionConfiguration.CustomersViewId },
            new RolePermission { RoleId = RoleConfiguration.GetSalesId(), PermissionId = PermissionConfiguration.CustomersCreateId },
            new RolePermission { RoleId = RoleConfiguration.GetSalesId(), PermissionId = PermissionConfiguration.CustomersEditId },
            // Viewer gets view only
            new RolePermission { RoleId = RoleConfiguration.GetViewerId(), PermissionId = PermissionConfiguration.CustomersViewId }
        );
    }
}
