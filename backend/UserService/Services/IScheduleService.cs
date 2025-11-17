using UserService.Models.Entities;
using UserService.Models.ScheduleDTOs;

namespace UserService.Services
{
    public interface IScheduleService
    {
        Task<ScheduleDTO> GetScheduleById(Guid scheduleId);
        Task<DoctorSchedule> AddSchedule(Guid doctorId, AddScheduleDTO dto);
        Task RemoveSchedule(Guid scheduleId);
        Task UpdateSchedule(Guid guid, ScheduleDTO dto);
        Task<List<TimeSlotDTO>> GetSlots(Guid doctorId, DateTime date);
        Task BlockSlotAsync(Guid doctorId, DateTime appointmentTime);
        Task UnblockSlotAsync(Guid doctorId, DateTime appointmentTime);
    }
}