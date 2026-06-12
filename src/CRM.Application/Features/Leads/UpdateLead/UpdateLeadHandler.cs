using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Leads.UpdateLead;

public class UpdateLeadHandler : IRequestHandler<UpdateLeadCommand, Unit>
{
    private readonly ILeadRepository _leadRepository;

    public UpdateLeadHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<Unit> Handle(UpdateLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _leadRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Lead), request.Id);

        lead.FirstName   = request.FirstName;
        lead.LastName    = request.LastName;
        lead.CompanyName = request.CompanyName;
        lead.Email       = request.Email;
        lead.Phone       = request.Phone;
        lead.Status      = request.Status;
        lead.OwnerId     = request.OwnerId;
        lead.UpdatedAt   = DateTime.UtcNow;

        await _leadRepository.UpdateAsync(lead, cancellationToken);

        return Unit.Value;
    }
}
