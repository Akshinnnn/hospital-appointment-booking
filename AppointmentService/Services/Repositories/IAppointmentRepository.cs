using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AppointmentService.Models.Entities;

namespace AppointmentService.Services.Repositories
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetAllAsync();
        Task<Appointment?> GetByIdAsync(Guid id);
        Task CreateAsync(Appointment appointment);
        Task DeleteAsync(Guid id);
        Task UpdateAsync(Appointment appointment);
        Task<List<Appointment>> GetByExpression(Expression<Func<Appointment, bool>> expression);
    }
}