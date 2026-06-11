using CRM.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, detail, errors) = exception switch
        {
            UnauthorizedException ex => (StatusCodes.Status401Unauthorized, ex.Message, (IDictionary<string, string[]>?)null),
            NotFoundException ex     => (StatusCodes.Status404NotFound,      ex.Message, null),
            ValidationException ex   => (StatusCodes.Status400BadRequest,    ex.Message, ex.Errors),
            _                        => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.", null)
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception");

        context.Response.StatusCode = statusCode;

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Detail = detail,
            Type   = $"https://httpstatuses.io/{statusCode}"
        };

        if (errors is not null)
            problem.Extensions["errors"] = errors;

        await context.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true;
    }
}
