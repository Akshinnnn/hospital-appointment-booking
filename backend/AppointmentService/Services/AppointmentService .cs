using AppointmentService.Messaging;
using AppointmentService.Models.DTOs.AppointmentDTOs;
using AppointmentService.Models.Entities;
using AppointmentService.Models.Responses;
using AppointmentService.Services.Repositories;
using AutoMapper;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Threading;
using Microsoft.Extensions.Logging;

namespace AppointmentService.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _repository;
        private readonly IMapper _mapper;
        private readonly IRabbitMqProducer _producer;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(
            IAppointmentRepository repository, 
            IMapper mapper, 
            IRabbitMqProducer producer,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<AppointmentService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _producer = producer;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
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
                appointments = await _repository.GetByExpression(a => a.DoctorId == userid && a.Status != AppointmentStatus.CANCELLED);
            }
            else if (role == "PATIENT")
            {
                appointments = await _repository.GetByExpression(a => a.PatientId == userid && a.Status != AppointmentStatus.CANCELLED);
            }
            else
            {
                return ApiResponse<List<AppointmentDTO>>.Fail("Invalid role");
            }

            var dtos = _mapper.Map<List<AppointmentDTO>>(appointments);
            
            // Fetch doctor information for each unique doctor ID in parallel with timeout
            var uniqueDoctorIds = dtos.Select(d => d.DoctorId).Distinct().ToList();
            var doctorInfoCache = new Dictionary<Guid, (string? Name, string? Specialization)>();
            
            if (uniqueDoctorIds.Any())
            {
                var tasks = uniqueDoctorIds.Select(async doctorId =>
                {
                    try
                    {
                        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));
                        var doctorInfo = await GetDoctorInfoAsync(doctorId, cts.Token);
                        return (doctorId, doctorInfo);
                    }
                    catch
                    {
                        // If fetching fails, return null values
                        return (doctorId, ((string?)null, (string?)null));
                    }
                });
                
                var results = await Task.WhenAll(tasks);
                foreach (var (doctorId, doctorInfo) in results)
                {
                    doctorInfoCache[doctorId] = doctorInfo;
                }
            }
            
            // Populate doctor information in DTOs
            foreach (var dto in dtos)
            {
                if (doctorInfoCache.TryGetValue(dto.DoctorId, out var doctorInfo))
                {
                    dto.DoctorName = doctorInfo.Name;
                    dto.Specialization = doctorInfo.Specialization;
                }
            }
            
            return ApiResponse<List<AppointmentDTO>>.Ok(dtos, "Appointments retrieved successfully");
        }

        private async Task<(string? Name, string? Specialization)> GetDoctorInfoAsync(Guid doctorId, CancellationToken cancellationToken = default)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(2);
                var userServiceUrl = _configuration["UserService:BaseUrl"] ?? "http://userservice:8080";
                var url = $"{userServiceUrl}/api/user/{doctorId}";
                _logger.LogDebug("Fetching doctor info from: {Url}", url);
                
                var response = await httpClient.GetAsync(url, cancellationToken);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogDebug("UserService response for doctor {DoctorId}: {Content}", doctorId, content);
                    
                    var apiResponse = JsonSerializer.Deserialize<JsonElement>(content);
                    
                    // Handle ApiResponse structure: { success: true, data: { ... }, message: "..." }
                    if (apiResponse.TryGetProperty("data", out var dataElement))
                    {
                        // UserService uses camelCase, so Full_Name becomes full_Name (underscore preserved), Specialisation becomes specialisation
                        // Try both fullName and full_Name for compatibility
                        JsonElement fullNameElement;
                        if (dataElement.TryGetProperty("full_Name", out fullNameElement) || 
                            dataElement.TryGetProperty("fullName", out fullNameElement))
                        {
                            var name = fullNameElement.GetString();
                            // Try both specialisation and specialization
                            var specialization = dataElement.TryGetProperty("specialisation", out var specElement) 
                                ? specElement.GetString() 
                                : (dataElement.TryGetProperty("specialization", out var specElement2) 
                                    ? specElement2.GetString() 
                                    : null);
                            
                            _logger.LogDebug("Successfully parsed doctor info: Name={Name}, Specialization={Specialization}", name, specialization);
                            return (name, specialization);
                        }
                        else
                        {
                            _logger.LogWarning("Could not find fullName or full_Name property in UserService response for doctor {DoctorId}", doctorId);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Could not find 'data' property in UserService response for doctor {DoctorId}", doctorId);
                    }
                }
                else
                {
                    _logger.LogWarning("UserService returned non-success status code {StatusCode} for doctor {DoctorId}", response.StatusCode, doctorId);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Timeout while fetching doctor info for doctor {DoctorId}", doctorId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching doctor info for doctor {DoctorId}", doctorId);
            }
            
            return (null, null);
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
