using CRM.Domain.Entities;
using CRM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.Infrastructure.Persistence.Configurations;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Subject).IsRequired().HasMaxLength(200);
        builder.Property(a => a.DueDate).IsRequired();
        builder.Property(a => a.ActivityType).HasDefaultValue(ActivityType.Task);
        builder.Property(a => a.Status).HasDefaultValue(ActivityStatus.Open);

        builder.HasOne(a => a.AssignedUser)
            .WithMany()
            .HasForeignKey(a => a.AssignedTo)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}
