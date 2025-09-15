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

    public async Task<DoctorSchedule> AddSchedule(Guid doctorId, AddScheduleDTO dto)
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
        return schedule;
    }

    public async Task<List<TimeSlotDTO>> GetSchedules(Guid doctorId, DateTime date)
    {
        if (doctorId == Guid.Empty)
            throw new ArgumentException("Doctor ID is required");

        var schedule = await _scheduleRepository.GetSchedule(doctorId, date);

        if (schedule == null)
            return new List<TimeSlotDTO>();

        var slots = new List<TimeSlotDTO>();
        var start = date.Date.Add(schedule.Start_Time);
        var end = date.Date.Add(schedule.End_Time);

        while (start < end)
        {
            var slotEnd = start.AddMinutes(30);

            slots.Add(new TimeSlotDTO
            {
                Start = start,
                End = slotEnd,
                IsAvailable = true
            });

            start = slotEnd;
        }

        return slots;
    }

    public async Task<ScheduleDTO> GetScheduleById(Guid scheduleId)
    {
        if (scheduleId == Guid.Empty)
            throw new ArgumentException("Schedule ID is required");

        var schedule = await _scheduleRepository.GetScheduleById(scheduleId);
        var scheduleDTO = _mapper.Map<ScheduleDTO>(schedule);
        return scheduleDTO;
    }

    public async Task RemoveSchedule(Guid scheduleId)
    {
        var schedule = await _scheduleRepository.GetScheduleById(scheduleId)
        ?? throw new KeyNotFoundException("Schedule not found.");

        await _scheduleRepository.DeleteAsync(schedule);
    }

    public async Task UpdateSchedule(Guid scheduleId, ScheduleDTO dto)
    {
        if (dto == null)
        throw new ArgumentException("Schedule data is required");

        if (!Enum.IsDefined(typeof(DayOfWeek), dto.Day_Of_Week))
            throw new ArgumentException("Invalid day of week");

        if (dto.Start_Time == default || dto.End_Time == default)
            throw new ArgumentException("Start time and end time must be provided");

        if (dto.Start_Time >= dto.End_Time)
            throw new ArgumentException("Start time must be earlier than end time");

        var schedule = await _scheduleRepository.GetScheduleById(scheduleId)
                    ?? throw new KeyNotFoundException("Schedule not found.");

        var exists = await _scheduleRepository.ExistsAsync(schedule.Doctor_Id, dto.Day_Of_Week, dto.Start_Time, dto.End_Time);
        if (exists && (schedule.Day_Of_Week != dto.Day_Of_Week ||
                    schedule.Start_Time  != dto.Start_Time  ||
                    schedule.End_Time    != dto.End_Time))
            throw new InvalidOperationException("This schedule already exists for the doctor.");

        schedule.Day_Of_Week = dto.Day_Of_Week;
        schedule.Start_Time  = dto.Start_Time;
        schedule.End_Time    = dto.End_Time;

        await _scheduleRepository.UpdateAsync(schedule);
    }
}
