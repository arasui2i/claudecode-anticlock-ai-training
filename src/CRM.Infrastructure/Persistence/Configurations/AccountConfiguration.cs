using CRM.Domain.Entities;
using CRM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.AccountName).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Industry).HasMaxLength(100);
        builder.Property(a => a.Website).HasMaxLength(500);
        builder.Property(a => a.Phone).HasMaxLength(30);
        builder.Property(a => a.Status).HasDefaultValue(AccountStatus.Active);

        builder.HasMany(a => a.Contacts)
            .WithOne(c => c.Account)
            .HasForeignKey(c => c.AccountId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}
