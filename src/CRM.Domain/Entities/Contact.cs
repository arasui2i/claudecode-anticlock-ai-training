using CRM.Domain.Enums;

namespace CRM.Domain.Entities;

public class Contact : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public Guid? AccountId { get; set; }
    public ContactStatus Status { get; set; } = ContactStatus.Active;
    public bool IsDeleted { get; set; } = false;

    public Account? Account { get; set; }
}
