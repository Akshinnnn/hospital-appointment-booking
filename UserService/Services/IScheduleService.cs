using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MassTransit;
using UserService.Models.DTOs;
using UserService.Models.Entities;
using UserService.Models.ScheduleDTOs;

namespace UserService.Services
{
    public interface IScheduleService
    {
        Task<ScheduleDTO> GetScheduleById(Guid scheduleId);
        Task<List<ScheduleDTO>> GetSchedules(Guid doctorId);
        Task<DoctorSchedule> AddSchedule(Guid doctorId, AddScheduleDTO dto);
        Task RemoveSchedule(Guid scheduleId);
        Task UpdateSchedule(Guid guid, ScheduleDTO dto);
    }
}