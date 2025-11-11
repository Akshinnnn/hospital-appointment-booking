using Microsoft.AspNetCore.Mvc;
using AppointmentService.Services;
using AppointmentService.Models.DTOs.AppointmentDTOs;
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
            return Ok(result);
        }

        [HttpGet("myappointments")]
        public async Task<IActionResult> GetMyAppointments()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
                return Unauthorized("Invalid token");

            var role = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            if (string.IsNullOrWhiteSpace(role))
                return Unauthorized("Invalid token");

            var appointments = await _service.GetMyAppointments(guid, role);
            return Ok(appointments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create(AppointmentCreateDTO dto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
                guid = Guid.Empty; 

            var entity = await _service.CreateAsync(dto, guid);
            
            return Ok(entity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return Ok("Appointment deleted");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            await _service.CancelAppointment(id);

            return Ok("Appointment cancelled");
        }
    }
}
