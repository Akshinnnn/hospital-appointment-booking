using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Models.DTOs;
using UserService.Services;

namespace UserService.Controllers;

[ApiController]
[Route("api")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
    }

    // POST: api/auth/register
    [HttpPost("auth/register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        var token = await _userService.RegisterAsync(dto);
        return Ok(new { Token = token });
    }

    // POST: api/auth/login
    [HttpPost("auth/login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        var token = await _userService.LoginAsync(dto);
        return Ok(new { Token = token });
    }

    // GET: api/profile
    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
            return Unauthorized("Invalid token");

        var userProfile = await _userService.GetUserProfileAsync(guid);
        return Ok(userProfile);
    }

    // DELETE: api/profile
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateAccount([FromBody] UpdateDTO dto)
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
            return Unauthorized("Invalid token");

        await _userService.UpdateUserAsync(guid, dto);
        return Ok();
    }
}
