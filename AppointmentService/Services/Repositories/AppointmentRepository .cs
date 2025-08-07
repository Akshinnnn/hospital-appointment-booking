using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppointmentService.Data;
using AppointmentService.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Services.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppointmentsDbContext _context;

        public AppointmentRepository(AppointmentsDbContext context)
        {
            _context = context;
        }

        public async Task<List<Appointment>> GetAllAsync() =>
            await _context.Appointments.ToListAsync();

        public async Task<Appointment?> GetByIdAsync(Guid id) =>
            await _context.Appointments.FirstOrDefaultAsync(a => a.Id == id);

        public async Task CreateAsync(Appointment appointment)
        {
            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _context.Appointments.FindAsync(id);
            if (entity == null) return;
            _context.Appointments.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
