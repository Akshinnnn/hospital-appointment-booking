using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using UserService.Models.ScheduleDTOs;
using UserService.Services;

namespace UserService.Controllers;
[ApiController]
[Route("api")]
[Authorize(Roles = "DOCTOR")]
public class ScheduleController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public ScheduleController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService ?? throw new ArgumentNullException(nameof(scheduleService));
    }

    // POST: api/schedule
    [HttpPost("schedule")]
    public async Task<IActionResult> AddSchedule([FromBody] AddScheduleDTO dto)
    {
        try
        {
            var doctorId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(doctorId) || !Guid.TryParse(doctorId, out var guid))
                return Unauthorized("Invalid token");

            await _scheduleService.AddSchedule(guid, dto);
            return Ok("Schedule added successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // GET: api/{doctorId}/schedule
    [AllowAnonymous]
    [HttpGet("{doctorId}/schedule")]
    public async Task<IActionResult> GetSchedules(Guid doctorId)
    {
        try
        {
            var schedule = await _scheduleService.GetSchedules(doctorId);
            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    // GET api/schedule/{scheduleId}
    [HttpGet("schedule/{scheduleId}")]
    public async Task<IActionResult> GetScheduleById(Guid scheduleId)
    {
        try
        {
            var doctorId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(doctorId) || !Guid.TryParse(doctorId, out var guid))
            return Unauthorized("Invalid token");
            var schedule = await _scheduleService.GetScheduleById(guid, scheduleId);
            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    // PUT: api/schedule/{scheduleId}
    [HttpPut("schedule/{scheduleId}")]
    public async Task<IActionResult> UpdateSchedule(Guid scheduleId, [FromBody] ScheduleDTO dto)
    {
        try
        {
            await _scheduleService.UpdateSchedule(scheduleId, dto);
            return Ok("Schedule updated successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/schedule/{scheduleId}
    [HttpDelete("schedule/{scheduleId}")]
    public async Task<IActionResult> DeleteSchedule(Guid scheduleId)
    {
    try
    {
        var doctorId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(doctorId) || !Guid.TryParse(doctorId, out var guid))
            return Unauthorized("Invalid token");
        await _scheduleService.RemoveSchedule(guid, scheduleId);
        return Ok("Schedule deleted successfully.");
    }
    catch (Exception ex)
    {
        return NotFound(ex.Message);
    }
}
}