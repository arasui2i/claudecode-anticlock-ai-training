using CRM.Application.Common.Interfaces;
using CRM.Infrastructure.Persistence;
using CRM.Infrastructure.Repositories;
using CRM.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CRM.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ILeadRepository, LeadRepository>();
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<IOpportunityRepository, OpportunityRepository>();
        services.AddScoped<IActivityRepository, ActivityRepository>();
        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        return services;
    }
}
