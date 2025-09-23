using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models.Entities;

namespace UserService.Services.Repositories
{
    public interface IScheduleRepository
    {
        Task AddScheduleAsync(DoctorSchedule schedule);
        Task UpdateScheduleAsync(DoctorSchedule schedule);
        Task DeleteAsync(DoctorSchedule schedule);
        Task<bool> ExistsAsync(Guid doctorId, DateTime start, DateTime end);
        Task<DoctorSchedule> GetSchedule(Guid doctorId, DateTime date);
        Task<DoctorSchedule> GetScheduleById(Guid id);
    }

    public class ScheduleRepository : IScheduleRepository
    {
        private readonly UsersDbContext _dbContext;

        public ScheduleRepository(UsersDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task AddScheduleAsync(DoctorSchedule schedule)
        {
            await _dbContext.Doctor_Schedules.AddAsync(schedule);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(DoctorSchedule schedule)
        {
            _dbContext.Doctor_Schedules.Remove(schedule);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(Guid doctorId, DateTime start, DateTime end)
        {
            return await _dbContext.Doctor_Schedules
            .AnyAsync(s => s.Start_Time == start && s.End_Time == end);
        }

        public async Task<DoctorSchedule> GetScheduleById(Guid id)
        {
            return await _dbContext.Doctor_Schedules.FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<DoctorSchedule> GetSchedule(Guid doctorId, DateTime date)
        {
            return await _dbContext.Doctor_Schedules
            .FirstOrDefaultAsync(s => s.Doctor_Id == doctorId && s.Start_Time.DayOfWeek == date.DayOfWeek);
        }

        public async Task UpdateScheduleAsync(DoctorSchedule schedule)
        {
            _dbContext.Doctor_Schedules.Update(schedule);
            await _dbContext.SaveChangesAsync();
        }
    }
}