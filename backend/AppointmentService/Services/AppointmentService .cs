using AppointmentService.Messaging;
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

        private readonly IRabbitMqProducer _producer;

        public AppointmentService(IAppointmentRepository repository, IMapper mapper, IRabbitMqProducer producer)
        {
            _repository = repository;
            _mapper = mapper;
            _producer = producer;
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

        public async Task<Appointment> CreateAsync(AppointmentCreateDTO dto, Guid patientId)
        {
            var existing = await _repository.GetByExpression(a =>
                a.DoctorId == dto.DoctorId &&
                a.AppointmentTime == dto.AppointmentTime &&
                a.Status != AppointmentStatus.CANCELLED);

            if (existing.Any())
                throw new InvalidOperationException("This appointment time is already taken.");

            var entity = _mapper.Map<Appointment>(dto);
            if (patientId == Guid.Empty)
            {
                entity.Status = AppointmentStatus.APPROVED;
            }
            else
            {
                entity.PatientId = patientId;
                entity.Status = AppointmentStatus.APPROVED;
            }
            

            await _repository.CreateAsync(entity);

            _producer.Publish("appointment-created", entity);

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
            _producer.Publish("appointment-cancelled", appointment);
        }

    }
}
