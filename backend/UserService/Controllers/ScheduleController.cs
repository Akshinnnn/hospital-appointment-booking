using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

            var schedule = await _scheduleService.AddSchedule(guid, dto);
            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // GET: api/{doctorId}/schedule
    [AllowAnonymous]
    [HttpGet("{doctorId}/schedule")]
    public async Task<IActionResult> GetSlots(Guid doctorId, [FromQuery] DateTime date)
    {
        try
        {
            var dateUtc = DateTime.SpecifyKind(date, DateTimeKind.Utc);
            var slots = await _scheduleService.GetSlots(doctorId, dateUtc);
            return Ok(slots);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    // GET api/schedule/{scheduleId}
    [HttpGet("schedule/{scheduleId}")]
    public async Task<IActionResult> GetScheduleById([FromRoute] Guid scheduleId)
    {
        try
        {
            var schedule = await _scheduleService.GetScheduleById(scheduleId);
            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    // PUT: api/schedule/{scheduleId}
    [HttpPut("schedule/{scheduleId}")]
    public async Task<IActionResult> UpdateSchedule([FromRoute] Guid scheduleId, [FromBody] ScheduleDTO dto)
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
    public async Task<IActionResult> DeleteSchedule([FromRoute] Guid scheduleId)
    {
    try
    {
        await _scheduleService.RemoveSchedule(scheduleId);
        return Ok("Schedule deleted successfully.");
    }
    catch (Exception ex)
    {
        return NotFound(ex.Message);
    }
}
}