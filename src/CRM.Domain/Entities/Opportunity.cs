using CRM.Domain.Enums;

namespace CRM.Domain.Entities;

public class Opportunity : BaseEntity
{
    public string OpportunityName { get; set; } = string.Empty;
    public Guid AccountId { get; set; }
    public Guid? ContactId { get; set; }
    public OpportunityStage Stage { get; set; } = OpportunityStage.Prospecting;
    public decimal? ExpectedRevenue { get; set; }
    public DateTime? CloseDate { get; set; }
    public bool IsDeleted { get; set; } = false;

    public Account Account { get; set; } = null!;
    public Contact? Contact { get; set; }
}
