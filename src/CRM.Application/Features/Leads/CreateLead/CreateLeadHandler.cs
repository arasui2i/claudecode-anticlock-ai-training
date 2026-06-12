using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Leads.CreateLead;

public class CreateLeadHandler : IRequestHandler<CreateLeadCommand, Guid>
{
    private readonly ILeadRepository _leadRepository;

    public CreateLeadHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<Guid> Handle(CreateLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = new Lead
        {
            FirstName   = request.FirstName,
            LastName    = request.LastName,
            CompanyName = request.CompanyName,
            Email       = request.Email,
            Phone       = request.Phone,
            Status      = request.Status,
            OwnerId     = request.OwnerId,
        };

        await _leadRepository.AddAsync(lead, cancellationToken);

        return lead.Id;
    }
}
