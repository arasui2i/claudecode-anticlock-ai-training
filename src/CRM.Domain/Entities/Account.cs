using CRM.Domain.Enums;

namespace CRM.Domain.Entities;

public class Account : BaseEntity
{
    public string AccountName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Website { get; set; }
    public string? Phone { get; set; }
    public AccountStatus Status { get; set; } = AccountStatus.Active;
    public bool IsDeleted { get; set; } = false;

    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
}
