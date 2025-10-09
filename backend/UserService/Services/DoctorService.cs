using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UserService.Models.Entities;
using UserService.Services.Repositories;

namespace UserService.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;

        public DoctorService(IDoctorRepository doctorRepository)
        {
            _doctorRepository = doctorRepository ?? throw new ArgumentNullException(nameof(doctorRepository));
        }

        public Task<List<User>> GetDoctorsBySpecialisationAsync(string specialisation)
        {
            return _doctorRepository.GetDoctorsBySpecialisationAsync(specialisation);
        }
    }
}