using System.Linq.Expressions;
using AppointmentService.Data;
using AppointmentService.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Services.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppointmentsDbContext _dbContext;

        public AppointmentRepository(AppointmentsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Appointment>> GetAllAsync() =>
            await _dbContext.Appointments.ToListAsync();

        public async Task<Appointment?> GetByIdAsync(Guid id) =>
            await _dbContext.Appointments.FirstOrDefaultAsync(a => a.Id == id);

        public async Task CreateAsync(Appointment appointment)
        {
            try
            {
                await _dbContext.Appointments.AddAsync(appointment);
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("duplicate") == true)
            {
                throw new InvalidOperationException("This appointment slot is already taken.", ex);
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _dbContext.Appointments.FindAsync(id);
            if (entity == null) return;
            _dbContext.Appointments.Remove(entity);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<List<Appointment>> GetByExpression(Expression<Func<Appointment, bool>> expression)
        {
            return await _dbContext.Appointments.Where(expression).ToListAsync();
        }

        public async Task UpdateAsync(Appointment appointment)
        {
            _dbContext.Appointments.Update(appointment);
            await _dbContext.SaveChangesAsync();
        }   
    }
}
