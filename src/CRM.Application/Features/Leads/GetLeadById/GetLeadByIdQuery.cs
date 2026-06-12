using MediatR;

namespace CRM.Application.Features.Leads.GetLeadById;

public record GetLeadByIdQuery(Guid Id) : IRequest<LeadDetailDto>;
