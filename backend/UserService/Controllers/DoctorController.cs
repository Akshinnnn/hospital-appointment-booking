using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Models.DTOs;
using UserService.Services;

namespace UserService.Controllers
{
    [Authorize (Roles = "ADMIN")]
    [ApiController]
    [Route("api/doctor")]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public DoctorController(IDoctorService doctorService)
        {
            _doctorService = doctorService ?? throw new ArgumentNullException(nameof(doctorService));
        }

        [AllowAnonymous]
        [HttpGet("{specialisation}")]
        public async Task<IActionResult> GetDoctorsBySpecialisation(string specialisation)
        {
            var doctors = await _doctorService.GetDoctorsBySpecialisationAsync(specialisation);
            return Ok(doctors);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorDTO dto)
        {
            try
            {
                await _doctorService.CreateDoctor(dto);
                return Ok("Doctor created successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}