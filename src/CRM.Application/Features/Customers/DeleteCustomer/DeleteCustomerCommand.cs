using MediatR;

namespace CRM.Application.Features.Customers.DeleteCustomer;

public record DeleteCustomerCommand(Guid Id) : IRequest<Unit>;
