using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using CRM.Application;
using CRM.Application.Common.Interfaces;
using CRM.Infrastructure;
using CRM.Infrastructure.Persistence;
using CRM.API.Authorization;
using CRM.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddControllers();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("customers.view",   p => p.AddRequirements(new PermissionRequirement("customers.view")));
    options.AddPolicy("customers.create", p => p.AddRequirements(new PermissionRequirement("customers.create")));
    options.AddPolicy("customers.edit",   p => p.AddRequirements(new PermissionRequirement("customers.edit")));
    options.AddPolicy("customers.delete", p => p.AddRequirements(new PermissionRequirement("customers.delete")));

    options.AddPolicy("leads.view",   p => p.AddRequirements(new PermissionRequirement("leads.view")));
    options.AddPolicy("leads.create", p => p.AddRequirements(new PermissionRequirement("leads.create")));
    options.AddPolicy("leads.edit",   p => p.AddRequirements(new PermissionRequirement("leads.edit")));
    options.AddPolicy("leads.delete", p => p.AddRequirements(new PermissionRequirement("leads.delete")));

    options.AddPolicy("contacts.view",   p => p.AddRequirements(new PermissionRequirement("contacts.view")));
    options.AddPolicy("contacts.create", p => p.AddRequirements(new PermissionRequirement("contacts.create")));
    options.AddPolicy("contacts.edit",   p => p.AddRequirements(new PermissionRequirement("contacts.edit")));
    options.AddPolicy("contacts.delete", p => p.AddRequirements(new PermissionRequirement("contacts.delete")));

    options.AddPolicy("accounts.view",   p => p.AddRequirements(new PermissionRequirement("accounts.view")));
    options.AddPolicy("accounts.create", p => p.AddRequirements(new PermissionRequirement("accounts.create")));
    options.AddPolicy("accounts.edit",   p => p.AddRequirements(new PermissionRequirement("accounts.edit")));
    options.AddPolicy("accounts.delete", p => p.AddRequirements(new PermissionRequirement("accounts.delete")));

    options.AddPolicy("opportunities.view",   p => p.AddRequirements(new PermissionRequirement("opportunities.view")));
    options.AddPolicy("opportunities.create", p => p.AddRequirements(new PermissionRequirement("opportunities.create")));
    options.AddPolicy("opportunities.edit",   p => p.AddRequirements(new PermissionRequirement("opportunities.edit")));
    options.AddPolicy("opportunities.delete", p => p.AddRequirements(new PermissionRequirement("opportunities.delete")));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(builder.Configuration["Cors:AllowedOrigins"]?.Split(',') ?? ["http://localhost:5173"])
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await DbSeeder.SeedAsync(db, hasher);
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
