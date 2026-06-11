using Microsoft.AspNetCore.Authorization;

namespace CRM.API.Authorization;

public class PermissionRequirement : IAuthorizationRequirement
{
    public string ActionKey { get; }

    public PermissionRequirement(string actionKey) => ActionKey = actionKey;
}
