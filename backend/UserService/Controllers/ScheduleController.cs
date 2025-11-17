using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Models.ScheduleDTOs;
using UserService.Services;

namespace UserService.Controllers;
[ApiController]
[Route("api")]
public class ScheduleController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public ScheduleController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService ?? throw new ArgumentNullException(nameof(scheduleService));
    }

    // POST: api/schedule
    [Authorize(Roles = "DOCTOR, ADMIN")]
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

    // GET: api/schedule/doctor/{doctorId}
    [AllowAnonymous]
    [HttpGet("schedule/doctor/{doctorId}")]
    public async Task<IActionResult> GetSlots(Guid doctorId, [FromQuery] DateTime date)
    {
        try
        {
            Console.WriteLine($"GetSlots called with doctorId: {doctorId}, date: {date}, date.Kind: {date.Kind}");
            
            if (doctorId == Guid.Empty)
                return BadRequest("Invalid doctor ID");
            
            if (date == default(DateTime))
            {
                Console.WriteLine("ERROR: Date parameter is default (not provided)");
                return BadRequest("Date parameter is required");
            }
            
            var dateUtc = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            Console.WriteLine($"Fetching slots for doctor {doctorId} on {dateUtc}");
            
            var slots = await _scheduleService.GetSlots(doctorId, dateUtc);
            Console.WriteLine($"Found {slots?.Count ?? 0} slots");
            
            // Return the slots (will be empty list if none exist)
            return Ok(slots);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR in GetSlots: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET api/schedule/{scheduleId}
    [Authorize(Roles = "DOCTOR, ADMIN")]
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
    [Authorize(Roles = "DOCTOR, ADMIN")]
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
    [Authorize(Roles = "DOCTOR, ADMIN")]
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