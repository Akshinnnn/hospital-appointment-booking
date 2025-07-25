using AutoMapper;
using MassTransit;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserService.Models.DTOs;
using UserService.Models.Entities;
using UserService.Services.Repositories;
using UserService.Models.ScheduleDTOs;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace UserService.Services;

public class ScheduleService : IScheduleService
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IMapper _mapper;

    public ScheduleService(
        IScheduleRepository scheduleRepository,
        IMapper mapper)
    {
        _scheduleRepository = scheduleRepository ?? throw new ArgumentNullException(nameof(scheduleRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task AddSchedule(Guid doctorId, AddScheduleDTO dto)
    {
        if (dto == null)
            throw new ArgumentException("Schedule data is required");

        if (doctorId == Guid.Empty)
            throw new ArgumentException("Doctor ID is required");

        if (!Enum.IsDefined(typeof(DayOfWeek), dto.Day_Of_Week))
            throw new ArgumentException("Invalid day of week");

        if (dto.Start_Time == default || dto.End_Time == default)
            throw new ArgumentException("Start time and end time must be provided");

        if (dto.Start_Time >= dto.End_Time)
            throw new ArgumentException("Start time must be earlier than end time");

        var exists = await _scheduleRepository.ExistsAsync(doctorId, dto.Day_Of_Week, dto.Start_Time, dto.End_Time);
        if (exists)
            throw new InvalidOperationException("This schedule already exists for the doctor");

        var schedule = _mapper.Map<DoctorSchedule>(dto);
        schedule.Doctor_Id = doctorId;
        await _scheduleRepository.AddAsync(schedule);
    }

    public async Task<List<ScheduleDTO>> GetSchedules(Guid doctorId)
    {
        if (doctorId == Guid.Empty)
            throw new ArgumentException("Doctor ID is required");

        var schedules = await _scheduleRepository.GetSchedules(doctorId) ?? throw new KeyNotFoundException("No information found!");

        var schedulesDTO = _mapper.Map<IEnumerable<ScheduleDTO>>(schedules).ToList();
        return schedulesDTO;
    }

    public async Task<ScheduleDTO> GetScheduleById(Guid doctorId, Guid scheduleId)
    {
        if (doctorId == Guid.Empty)
            throw new ArgumentException("Doctor ID is required");

        if (scheduleId == Guid.Empty)
            throw new ArgumentException("Schedule ID is required");

        var schedules = await _scheduleRepository.GetSchedules(doctorId) ?? throw new KeyNotFoundException("No information found!");
        var schedule = schedules.FirstOrDefault(s => s.Id == scheduleId);
        var scheduleDTO = _mapper.Map<ScheduleDTO>(schedule);
        return scheduleDTO;
    }

    public async Task RemoveSchedule(Guid doctorId, Guid scheduleId)
    {
        if (doctorId == Guid.Empty)
            throw new ArgumentException("Doctor ID is required");

        var schedules = await _scheduleRepository.GetSchedules(doctorId) 
                        ?? throw new KeyNotFoundException("No schedule found for this doctor.");

        var schedule = schedules.FirstOrDefault(s => s.Id == scheduleId);
        if (schedule == null)
            throw new KeyNotFoundException("Schedule not found.");

        await _scheduleRepository.DeleteAsync(schedule);
    }

    public async Task UpdateSchedule(Guid guid, ScheduleDTO dto)
    {
        if (dto == null)
            throw new ArgumentException("Schedule data is required");

        if (!Enum.IsDefined(typeof(DayOfWeek), dto.Day_Of_Week))
            throw new ArgumentException("Invalid day of week");

        if (dto.Start_Time == default || dto.End_Time == default)
            throw new ArgumentException("Start time and end time must be provided");

        if (dto.Start_Time >= dto.End_Time)
            throw new ArgumentException("Start time must be earlier than end time");

        var schedule = await _scheduleRepository.GetScheduleById(guid);
        var updatedSchedule = _mapper.Map<DoctorSchedule>(schedule);
        await _scheduleRepository.UpdateAsync(updatedSchedule);
    }
}
