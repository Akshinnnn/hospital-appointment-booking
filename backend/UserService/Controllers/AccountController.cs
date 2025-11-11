using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Models.DTOs;
using UserService.Models.Responses;
using UserService.Services;

namespace UserService.Controllers;

[Authorize]
[ApiController]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly IUserService _userService;

    public AccountController(IUserService userService) => _userService = userService;

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(idClaim, out var userId))
            return Unauthorized(ApiResponse<string>.Fail("Invalid token"));

        var result = await _userService.GetUserProfileAsync(userId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAccount([FromBody] UpdateDTO dto)
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(idClaim, out var userId))
            return Unauthorized(ApiResponse<string>.Fail("Invalid token"));

        var result = await _userService.UpdateAccountAsync(userId, dto);
        return result.Success ? Ok(result) : NotFound(result);
    }
}

