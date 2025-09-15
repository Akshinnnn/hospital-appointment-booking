using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppointmentService.Models.DTOs.AppointmentDTOs;
using AppointmentService.Models.Entities;

namespace AppointmentService.Services
{
    public interface IAppointmentService
    {
        Task<List<AppointmentDTO>> GetAllAsync();
        Task<AppointmentDTO> GetByIdAsync(Guid id);
        Task<Appointment> CreateAsync(AppointmentCreateDTO dto, Guid guid);
        Task DeleteAsync(Guid id);

        Task<List<AppointmentDTO>> GetMyAppointments(Guid userid, string role);
    }
}