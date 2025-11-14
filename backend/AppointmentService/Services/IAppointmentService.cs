using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppointmentService.Models.DTOs.AppointmentDTOs;
using AppointmentService.Models.Entities;
using AppointmentService.Models.Responses;

namespace AppointmentService.Services
{
    public interface IAppointmentService
    {
        Task<ApiResponse<List<AppointmentDTO>>> GetAllAsync();
        Task<ApiResponse<AppointmentDTO>> GetByIdAsync(Guid id);
        Task<ApiResponse<AppointmentDTO>> CreateAsync(AppointmentCreateDTO dto, Guid guid);
        Task<ApiResponse<string>> DeleteAsync(Guid id);
        Task<ApiResponse<string>> CancelAppointment(Guid id);
        Task<ApiResponse<List<AppointmentDTO>>> GetMyAppointments(Guid userid, string role);
    }
}