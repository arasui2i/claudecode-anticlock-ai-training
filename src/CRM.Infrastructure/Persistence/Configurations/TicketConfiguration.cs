using CRM.Domain.Entities;
using CRM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.Infrastructure.Persistence.Configurations;

public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.TicketNumber).IsRequired().HasMaxLength(20);
        builder.HasIndex(t => t.TicketNumber).IsUnique();

        builder.Property(t => t.Subject).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Priority).HasDefaultValue(TicketPriority.Medium);
        builder.Property(t => t.Status).HasDefaultValue(TicketStatus.Open);

        builder.HasOne(t => t.Account)
            .WithMany()
            .HasForeignKey(t => t.AccountId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.Contact)
            .WithMany()
            .HasForeignKey(t => t.ContactId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}
