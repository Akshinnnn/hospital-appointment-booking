using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models.Entities;

namespace UserService.Services.Repositories
{
    public interface IDoctorRepository
    {
        Task<List<User>> GetDoctorsBySpecialisationAsync(string specialisation);
    }


    public class DoctorRepository : IDoctorRepository
    {
        private readonly UsersDbContext _dbContext;

        public DoctorRepository(UsersDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<List<User>> GetDoctorsBySpecialisationAsync(string specialisation)
        {
            return await _dbContext.Users
                .Where(u => u.Role == UserRole.DOCTOR && u.Specialisation == specialisation)
                .ToListAsync();
        }
    }
}