using AppointmentService.Messaging;
using AppointmentService.Models.DTOs.AppointmentDTOs;
using AppointmentService.Models.Entities;
using AppointmentService.Models.Responses;
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

        public async Task<ApiResponse<List<AppointmentDTO>>> GetAllAsync()
        {
            var appointments = await _repository.GetAllAsync();
            var dtos = _mapper.Map<List<AppointmentDTO>>(appointments);
            return ApiResponse<List<AppointmentDTO>>.Ok(dtos, "Appointments retrieved successfully");
        }

        public async Task<ApiResponse<AppointmentDTO>> GetByIdAsync(Guid id)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment == null)
                return ApiResponse<AppointmentDTO>.Fail("Appointment not found");

            var dto = _mapper.Map<AppointmentDTO>(appointment);
            return ApiResponse<AppointmentDTO>.Ok(dto, "Appointment retrieved successfully");
        }

        public async Task<ApiResponse<AppointmentDTO>> CreateAsync(AppointmentCreateDTO dto, Guid patientId)
        {
            var existing = await _repository.GetByExpression(a =>
                a.DoctorId == dto.DoctorId &&
                a.AppointmentTime == dto.AppointmentTime &&
                a.Status != AppointmentStatus.CANCELLED);

            if (existing.Any())
                return ApiResponse<AppointmentDTO>.Fail("This appointment time is already taken.");

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
            
            // Generate unique appointment number
            entity.AppointmentNumber = await GenerateUniqueAppointmentNumberAsync();

            await _repository.CreateAsync(entity);

            _producer.Publish("appointment-created", entity);

            var resultDto = _mapper.Map<AppointmentDTO>(entity);
            return ApiResponse<AppointmentDTO>.Ok(resultDto, "Appointment created successfully");
        }

        private async Task<string> GenerateUniqueAppointmentNumberAsync()
        {
            string appointmentNumber;
            bool isUnique = false;
            int attempts = 0;
            const int maxAttempts = 10;

            do
            {
                // Generate appointment number: APT-YYYYMMDD-HHMMSS-XXXX (last 4 random digits)
                var timestamp = DateTime.UtcNow;
                var randomSuffix = new Random().Next(1000, 9999);
                appointmentNumber = $"APT-{timestamp:yyyyMMdd}-{timestamp:HHmmss}-{randomSuffix}";

                var existing = await _repository.GetByExpression(a => a.AppointmentNumber == appointmentNumber);
                isUnique = !existing.Any();
                attempts++;
            } while (!isUnique && attempts < maxAttempts);

            if (!isUnique)
            {
                // Fallback: use GUID if we can't generate a unique number
                appointmentNumber = $"APT-{Guid.NewGuid().ToString("N").Substring(0, 12).ToUpper()}";
            }

            return appointmentNumber;
        }


        public async Task<ApiResponse<string>> DeleteAsync(Guid id)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment == null)
                return ApiResponse<string>.Fail("Appointment not found");

            await _repository.DeleteAsync(id);
            return ApiResponse<string>.Ok("Appointment deleted successfully", "Appointment deleted successfully");
        }

        public async Task<ApiResponse<List<AppointmentDTO>>> GetMyAppointments(Guid userid, string role)
        {
            List<Appointment> appointments;
            if (role == "DOCTOR")
            {
                appointments = await _repository.GetByExpression(a => a.DoctorId == userid);
            }
            else if (role == "PATIENT")
            {
                appointments = await _repository.GetByExpression(a => a.PatientId == userid);
            }
            else
            {
                return ApiResponse<List<AppointmentDTO>>.Fail("Invalid role");
            }

            var dtos = _mapper.Map<List<AppointmentDTO>>(appointments);
            return ApiResponse<List<AppointmentDTO>>.Ok(dtos, "Appointments retrieved successfully");
        }

        public async Task<ApiResponse<string>> CancelAppointment(Guid id)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment == null)
                return ApiResponse<string>.Fail("Appointment not found");

            appointment.Status = AppointmentStatus.CANCELLED;

            await _repository.UpdateAsync(appointment);
            _producer.Publish("appointment-cancelled", appointment);

            return ApiResponse<string>.Ok("Appointment cancelled successfully", "Appointment cancelled successfully");
        }

    }
}
