using MedicalRecordService.Models.DTOs;
using MedicalRecordService.Services;
using MedicalRecordsService.Models.DTOs;
using MedicalRecordsService.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedicalRecordService.Controllers
{
    [ApiController]
    [Route("api/medicalrecords")]
    public class RecordsController : ControllerBase
    {
        private readonly IRecordService _service;

        public RecordsController(IRecordService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] AddRecordDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var record = await _service.AddRecord(dto);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = record.Id },
                    new { message = "Record uploaded successfully", record });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to upload record", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var record = await _service.GetById(id);
            if (record == null)
                return NotFound(new { message = $"Record with id {id} not found" });

            return Ok(record);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _service.Delete(id);
                return Ok(new { message = $"Record {id} deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Record {id} not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete record", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRecordDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.Update(id, dto);
                return Ok(new { message = "Record updated successfully", record = updated });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Record {id} not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update record", error = ex.Message });
            }
        }
    }
}
