using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Leads.GetLeadById;

public class GetLeadByIdHandler : IRequestHandler<GetLeadByIdQuery, LeadDetailDto>
{
    private readonly ILeadRepository _leadRepository;

    public GetLeadByIdHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<LeadDetailDto> Handle(
        GetLeadByIdQuery request, CancellationToken cancellationToken)
    {
        var lead = await _leadRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Lead), request.Id);

        return new LeadDetailDto(
            lead.Id,
            lead.FirstName,
            lead.LastName,
            lead.CompanyName,
            lead.Email,
            lead.Phone,
            lead.Status,
            lead.OwnerId,
            lead.CreatedAt,
            lead.UpdatedAt);
    }
}
