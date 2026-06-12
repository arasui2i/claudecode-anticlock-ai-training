using CRM.Application.Common.Exceptions;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using MediatR;

namespace CRM.Application.Features.Leads.DeleteLead;

public class DeleteLeadHandler : IRequestHandler<DeleteLeadCommand, Unit>
{
    private readonly ILeadRepository _leadRepository;

    public DeleteLeadHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<Unit> Handle(DeleteLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _leadRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Lead), request.Id);

        lead.IsDeleted = true;
        lead.UpdatedAt = DateTime.UtcNow;

        await _leadRepository.UpdateAsync(lead, cancellationToken);

        return Unit.Value;
    }
}
