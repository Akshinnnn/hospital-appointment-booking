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
        Task CreateDoctorAsync(User doctor);
        Task UpdateDoctorSpecialisationAsync(User doctor);
    }


    public class DoctorRepository : IDoctorRepository
    {
        private readonly UsersDbContext _dbContext;

        public DoctorRepository(UsersDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task CreateDoctorAsync(User doctor)
        {
            await _dbContext.Users.AddAsync(doctor);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<List<User>> GetDoctorsBySpecialisationAsync(string specialisation)
        {
            return await _dbContext.Users
                .Where(u => u.Role == UserRole.DOCTOR && u.Specialisation == specialisation)
                .ToListAsync();
        }

        public async Task UpdateDoctorSpecialisationAsync(User doctor)
        {
            _dbContext.Users.Update(doctor);
            await _dbContext.SaveChangesAsync();
        }
    }
}