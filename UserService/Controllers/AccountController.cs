using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Models.DTOs;
using UserService.Services;

namespace UserService.Controllers;

[ApiController]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly IAuthService _authService;

    public AccountController(IAuthService authService)
    {
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));
    }

    // GET: api/account
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
            return Unauthorized("Invalid token");

        var userProfile = await _authService.GetUserProfileAsync(guid);
        return Ok(userProfile);
    }

    // UPDATE: api/account
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> UpdateAccount([FromBody] UpdateDTO dto)
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
            return Unauthorized("Invalid token");

        await _authService.UpdateUserAsync(guid, dto);
        return Ok();
    }
}
