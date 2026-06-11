using CRM.Application.Features.Customers;
using MediatR;

namespace CRM.Application.Features.Customers.GetCustomerById;

public record GetCustomerByIdQuery(Guid Id) : IRequest<CustomerDetailDto>;
