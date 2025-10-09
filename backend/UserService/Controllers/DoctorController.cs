using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using UserService.Services;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/doctor")]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public DoctorController(IDoctorService doctorService)
        {
            _doctorService = doctorService ?? throw new ArgumentNullException(nameof(doctorService));
        }

        [HttpGet("{specialisation}")]
        public async Task<IActionResult> GetDoctorsBySpecialisation(string specialisation)
        {
            var doctors = await _doctorService.GetDoctorsBySpecialisationAsync(specialisation);
            return Ok(doctors);
        }
    }
}