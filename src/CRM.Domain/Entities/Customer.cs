using CRM.Domain.Enums;

namespace CRM.Domain.Entities;

public class Customer : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Company { get; set; }
    public CustomerStatus Status { get; set; } = CustomerStatus.Lead;
    public string? JobTitle { get; set; }
    public Gender? Gender { get; set; }
    public int? Age { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Industry { get; set; }
    public decimal? AnnualIncome { get; set; }
    public int? EmployeeCount { get; set; }
    public string? HeadquartersAddress { get; set; }
    public bool IsDeleted { get; set; } = false;
}
