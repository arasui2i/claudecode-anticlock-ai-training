using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.Infrastructure.Persistence.Configurations;

public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(l => l.LastName).HasMaxLength(100);
        builder.Property(l => l.CompanyName).IsRequired().HasMaxLength(200);
        builder.Property(l => l.Email).IsRequired().HasMaxLength(256);
        builder.Property(l => l.Phone).HasMaxLength(30);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(l => l.OwnerId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(l => !l.IsDeleted);
    }
}
