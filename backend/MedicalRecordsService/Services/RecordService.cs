using AutoMapper;
using Google.Cloud.Storage.V1;
using MedicalRecordService.Models;
using MedicalRecordService.Models.DTOs;
using MedicalRecordService.Services.Repositories;
using MedicalRecordsService.GoogleCloudConfiguration;
using MedicalRecordsService.Messaging;
using MedicalRecordsService.Models.DTOs;
using MedicalRecordsService.Models.Responses;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace MedicalRecordsService.Services
{
    public class RecordService : IRecordService
    {
        private readonly IMapper _mapper;
        private readonly IRecordRepository _repository;
        private readonly StorageClient _storageClient;
        private readonly GoogleCloudConfig _options;
        private readonly IRabbitMqProducer _producer;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<RecordService> _logger;

        public RecordService(
            IMapper mapper,
            IRecordRepository repository,
            StorageClient storageClient,
            IOptions<GoogleCloudConfig> options,
            IRabbitMqProducer producer,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<RecordService> logger)
        {
            _repository = repository;
            _storageClient = storageClient;
            _options = options.Value;
            _mapper = mapper;
            _producer = producer;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ApiResponse<Record>> AddRecord(Guid id, AddRecordDTO dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return ApiResponse<Record>.Fail("File is required");

            var fileName = $"{Guid.NewGuid()}_{dto.File.FileName}";
            using var stream = dto.File.OpenReadStream();

            try
            {
                await _storageClient.UploadObjectAsync(
                    bucket: _options.BucketName,
                    objectName: fileName,
                    contentType: dto.File.ContentType,
                    source: stream);

                var record = new Record
                {
                    Patient_Id = dto.Patient_Id,
                    Doctor_Id = id,
                    Title = dto.Title,
                    Description = dto.Description,
                    FilePath = $"https://storage.googleapis.com/{_options.BucketName}/{fileName}",
                    FileName = dto.File.FileName,
                    ContentType = dto.File.ContentType
                };

                await _repository.AddAsync(record);

                // Publish message to RabbitMQ for notification
                try
                {
                    var patientEmail = await GetPatientEmailAsync(dto.Patient_Id);
                    var message = new
                    {
                        Id = record.Id,
                        Patient_Id = record.Patient_Id,
                        PatientEmail = patientEmail ?? string.Empty,
                        Doctor_Id = record.Doctor_Id,
                        Title = record.Title,
                        Description = record.Description,
                        CreatedAt = record.CreatedAt,
                        FilePath = record.FilePath,
                        FileName = record.FileName
                    };
                    _producer.Publish("medical-record-created", message);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to publish medical record creation message");
                    // Don't fail the record creation if notification fails
                }

                return ApiResponse<Record>.Ok(record, "Record uploaded successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<Record>.Fail($"Failed to upload file to Google Cloud Storage: {ex.Message}");
            }
        }

        public async Task<ApiResponse<Record>> GetById(Guid id)
        {
            var record = await _repository.GetByIdAsync(id);
            if (record == null)
                return ApiResponse<Record>.Fail("Record not found");

            var objectName = Path.GetFileName(record.FilePath);

            var urlSigner = UrlSigner.FromServiceAccountPath(_options.CredentialsPath);
            var signedUrl = urlSigner.Sign(
                _options.BucketName,
                objectName,
                TimeSpan.FromMinutes(15), 
                HttpMethod.Get);

            record.FilePath = signedUrl; 
            return ApiResponse<Record>.Ok(record, "Record retrieved successfully");
        }

        public async Task<ApiResponse<Record>> Update(Guid id, UpdateRecordDTO dto)
        {
            var record = await _repository.GetByIdAsync(id);
            if (record == null)
                return ApiResponse<Record>.Fail("Record not found");

            record.Title = dto.Title ?? record.Title;
            record.Description = dto.Description ?? record.Description;

            try
            {
                await _repository.UpdateAsync(record);
                return ApiResponse<Record>.Ok(record, "Record updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<Record>.Fail($"Failed to update record: {ex.Message}");
            }
        }

        public async Task<ApiResponse<string>> Delete(Guid id)
        {
            var record = await _repository.GetByIdAsync(id);
            if (record == null)
                return ApiResponse<string>.Fail("Record not found");

            try
            {
                if (!string.IsNullOrEmpty(record.FilePath))
                {
                    var objectName = Path.GetFileName(record.FilePath);
                    await _storageClient.DeleteObjectAsync(_options.BucketName, objectName);
                }

                await _repository.DeleteAsync(record);
                return ApiResponse<string>.Ok("Record deleted successfully", "Record deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.Fail($"Failed to delete record: {ex.Message}");
            }
        }

        public async Task<ApiResponse<List<Record>>> GetMyRecords(Guid userId, string role)
        {
            List<Record> records;
            if (role == "DOCTOR")
            {
                records = await _repository.GetByExpression(r => r.Doctor_Id == userId);
            }
            else if (role == "PATIENT")
            {
                records = await _repository.GetByExpression(r => r.Patient_Id == userId);
            }
            else
            {
                return ApiResponse<List<Record>>.Fail("Invalid role");
            }

            return ApiResponse<List<Record>>.Ok(records, "Records retrieved successfully");
        }

        private async Task<string?> GetPatientEmailAsync(Guid patientId)
        {
            try
            {
                // TODO: Add an endpoint in UserService to get user by ID for internal service calls
                // For now, we'll publish the message without email and NotificationService will handle it
                // Option 1: Add a public/internal endpoint in UserService: GET /api/user/{id}
                // Option 2: Use service-to-service authentication token
                
                var httpClient = _httpClientFactory.CreateClient();
                var userServiceUrl = _configuration["UserService:BaseUrl"] ?? "http://userservice:8080";
                
                // Try to get user from account endpoint (requires auth) or add a new internal endpoint
                // For now, return null - NotificationService will log a warning if email is missing
                _logger.LogInformation($"Attempting to fetch patient email for patient {patientId}");
                
                // Note: This will fail without authentication. 
                // In production, add a service-to-service endpoint or use service tokens
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Failed to fetch patient email for patient {patientId}");
            }

            return null;
        }
    }
}
