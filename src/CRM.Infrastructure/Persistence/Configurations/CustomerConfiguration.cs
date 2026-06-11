using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(c => c.LastName).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Email).IsRequired().HasMaxLength(256);
        builder.Property(c => c.Company).HasMaxLength(200);
        builder.Property(c => c.JobTitle).HasMaxLength(100);
        builder.Property(c => c.PhoneNumber).HasMaxLength(30);
        builder.Property(c => c.Industry).HasMaxLength(100);
        builder.Property(c => c.HeadquartersAddress).HasMaxLength(500);
        builder.Property(c => c.AnnualIncome).HasPrecision(18, 2);

        builder.HasIndex(c => c.Email).IsUnique();

        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
