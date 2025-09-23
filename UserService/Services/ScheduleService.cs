using AutoMapper;
using UserService.Models.Entities;
using UserService.Services.Repositories;
using UserService.Models.ScheduleDTOs;

namespace UserService.Services;

public class ScheduleService : IScheduleService
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ISlotRepository _slotRepository;
    private readonly IMapper _mapper;

    public ScheduleService(
    IScheduleRepository scheduleRepository,
    ISlotRepository slotRepository,
    IMapper mapper)
    {
        _scheduleRepository = scheduleRepository ?? throw new ArgumentNullException(nameof(scheduleRepository));
        _slotRepository = slotRepository ?? throw new ArgumentNullException(nameof(slotRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<DoctorSchedule> AddSchedule(Guid doctorId, AddScheduleDTO dto)
    {
        if (dto == null)
            throw new ArgumentException("Schedule data is required");

        if (doctorId == Guid.Empty)
            throw new ArgumentException("Doctor ID is required");

        if (dto.Start_Time == default || dto.End_Time == default)
            throw new ArgumentException("Start time and end time must be provided");

        if (dto.Start_Time >= dto.End_Time)
            throw new ArgumentException("Start time must be earlier than end time");

        // Check if schedule already exists
        var exists = await _scheduleRepository.ExistsAsync(doctorId, dto.Start_Time, dto.End_Time);
        if (exists)
            throw new InvalidOperationException("This schedule already exists for the doctor");

        // Add schedule
        var startUtc = DateTime.SpecifyKind(dto.Start_Time, DateTimeKind.Utc);
        var endUtc = DateTime.SpecifyKind(dto.End_Time, DateTimeKind.Utc);

        // Add schedule
        var schedule = _mapper.Map<DoctorSchedule>(dto);
        schedule.Doctor_Id = doctorId;
        schedule.Start_Time = startUtc;
        schedule.End_Time = endUtc;
        await _scheduleRepository.AddScheduleAsync(schedule);

        // Create slots
        var slots = new List<Slot>();
        var current = startUtc;
        while (current < endUtc)
        {
            var slotEnd = current.AddMinutes(30);

            slots.Add(new Slot
            {
                DoctorId = doctorId,
                Start = current,
                End = slotEnd,
                IsAvailable = true
            });

            current = slotEnd;
        }

        await _slotRepository.AddSlotsAsync(slots);

        return schedule;
    }

    public async Task<List<TimeSlotDTO>> GetSlots(Guid doctorId, DateTime date)
    {
        if (doctorId == Guid.Empty)
            throw new ArgumentException("Doctor ID is required");

        var slots = await _slotRepository.GetSlots(doctorId, date);

        return _mapper.Map<List<TimeSlotDTO>>(slots);
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

        if (dto.Start_Time == default || dto.End_Time == default)
            throw new ArgumentException("Start time and end time must be provided");

        if (dto.Start_Time >= dto.End_Time)
            throw new ArgumentException("Start time must be earlier than end time");

        var schedule = await _scheduleRepository.GetScheduleById(scheduleId)
                    ?? throw new KeyNotFoundException("Schedule not found.");

        var exists = await _scheduleRepository.ExistsAsync(schedule.Doctor_Id, dto.Start_Time, dto.End_Time);
        if (exists && (schedule.Start_Time != dto.Start_Time ||
                    schedule.End_Time != dto.End_Time))
            throw new InvalidOperationException("This schedule already exists for the doctor.");

        schedule.Start_Time = dto.Start_Time;
        schedule.End_Time = dto.End_Time;

        await _scheduleRepository.UpdateScheduleAsync(schedule);
    }
    
    public async Task BlockSlotAsync(Guid doctorId, DateTime appointmentTime)
    {
        var slot = await _slotRepository.GetSlot(doctorId, appointmentTime);
        if (slot != null)
        {
            slot.IsAvailable = false;
            await _slotRepository.UpdateSlotAsync(slot);
        }
    }
}
