using CRM.Domain.Enums;

namespace CRM.Domain.Entities;

public class Ticket : BaseEntity
{
    public string TicketNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public Guid? AccountId { get; set; }
    public Guid? ContactId { get; set; }
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public bool IsDeleted { get; set; } = false;

    public Account? Account { get; set; }
    public Contact? Contact { get; set; }
}
