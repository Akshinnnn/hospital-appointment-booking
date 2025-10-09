using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UserService.Models.Entities;

namespace UserService.Services
{
    public interface IDoctorService
    {
        Task<List<User>> GetDoctorsBySpecialisationAsync(string specialisation);    
    }
}