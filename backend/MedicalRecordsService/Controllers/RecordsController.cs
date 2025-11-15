using MedicalRecordService.Models.DTOs;
using MedicalRecordService.Services;
using MedicalRecordsService.Models.DTOs;
using MedicalRecordsService.Models.Responses;
using MedicalRecordsService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalRecordService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/record")]
    public class RecordsController : ControllerBase
    {
        private readonly IRecordService _service;

        public RecordsController(IRecordService service)
        {
            _service = service;
        }

        [Authorize(Roles = "DOCTOR, ADMIN")]
        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] AddRecordDTO dto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
                return Unauthorized(ApiResponse<string>.Fail("Invalid token"));

            var result = await _service.AddRecord(guid, dto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.Id },
                result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetById(id);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        [Authorize(Roles = "DOCTOR, ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.Delete(id);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        [Authorize(Roles = "DOCTOR, ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRecordDTO dto)
        {
            var result = await _service.Update(id, dto);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        [Authorize(Roles = "DOCTOR, PATIENT")]
        [HttpGet("myrecords")]
        public async Task<IActionResult> GetMyRecords()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var guid))
                return Unauthorized(ApiResponse<string>.Fail("Invalid token"));

            var role = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            if (string.IsNullOrWhiteSpace(role))
                return Unauthorized(ApiResponse<string>.Fail("Invalid token"));

            var result = await _service.GetMyRecords(guid, role);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }
    }
}
