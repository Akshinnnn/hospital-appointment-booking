using AppointmentService.Models.DTOs.AppointmentDTOs;
using AppointmentService.Models.Entities;
using AppointmentService.Services.Repositories;
using AutoMapper;

namespace AppointmentService.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _repository;
        private readonly IMapper _mapper;

        public AppointmentService(IAppointmentRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<AppointmentDTO>> GetAllAsync()
        {
            var appointments = await _repository.GetAllAsync();
            return _mapper.Map<List<AppointmentDTO>>(appointments);
        }

        public async Task<AppointmentDTO> GetByIdAsync(Guid id)
        {
            var appointment = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Appointment not found");
            return _mapper.Map<AppointmentDTO>(appointment);
        }

        public async Task<Appointment> CreateAsync(AppointmentCreateDTO dto, Guid guid)
        {
            var entity = _mapper.Map<Appointment>(dto);
            entity.PatientId = guid;
            await _repository.CreateAsync(entity);
            return entity;
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }

        public async Task<List<AppointmentDTO>> GetMyAppointments(Guid userid, string role)
        {
            if (role == "DOCTOR")
            {
                List<Appointment> appointments = await _repository.GetByExpression(a => a.DoctorId == userid);
                return _mapper.Map<List<AppointmentDTO>>(appointments);
            }

            if (role == "PATIENT")
            {
                List<Appointment> appointments = await _repository.GetByExpression(a => a.PatientId == userid);
                return _mapper.Map<List<AppointmentDTO>>(appointments);
            }

            return new List<AppointmentDTO>();
        }

        public async Task CancelAppointment(Guid id)
        {
            var appointment = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Appointment not found");
            appointment.Status = AppointmentStatus.CANCELLED;
            await _repository.UpdateAsync(appointment);
        }

    }
}
