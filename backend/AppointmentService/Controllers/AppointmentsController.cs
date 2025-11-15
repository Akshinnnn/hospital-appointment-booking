using Microsoft.AspNetCore.Mvc;
using AppointmentService.Services;
using AppointmentService.Models.DTOs.AppointmentDTOs;
using AppointmentService.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using AppointmentService.Messaging;

namespace AppointmentService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/appointment")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public AppointmentsController(IAppointmentService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("myappointments")]
        public async Task<IActionResult> GetMyAppointments()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
                return Unauthorized(ApiResponse<string>.Fail("Invalid token"));

            var role = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            if (string.IsNullOrWhiteSpace(role))
                return Unauthorized(ApiResponse<string>.Fail("Invalid token"));

            var result = await _service.GetMyAppointments(guid, role);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create(AppointmentCreateDTO dto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
                guid = Guid.Empty; 

            var result = await _service.CreateAsync(dto, guid);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var result = await _service.CancelAppointment(id);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }
    }
}
