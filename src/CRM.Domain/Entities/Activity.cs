using CRM.Domain.Enums;

namespace CRM.Domain.Entities;

public class Activity : BaseEntity
{
    public string Subject { get; set; } = string.Empty;
    public ActivityType ActivityType { get; set; } = ActivityType.Task;
    public DateTime DueDate { get; set; }
    public ActivityStatus Status { get; set; } = ActivityStatus.Open;
    public Guid? AssignedTo { get; set; }
    public bool IsDeleted { get; set; } = false;

    public User? AssignedUser { get; set; }
}
