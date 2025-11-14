using AutoMapper;
using Google.Cloud.Storage.V1;
using Google.Cloud.Storage.V1.SignedUrls;
using MedicalRecordService.Models;
using MedicalRecordService.Models.DTOs;
using MedicalRecordService.Services.Repositories;
using MedicalRecordsService.GoogleCloudConfiguration;
using MedicalRecordsService.Models.DTOs;
using MedicalRecordsService.Models.Responses;
using Microsoft.Extensions.Options;

namespace MedicalRecordsService.Services
{
    public class RecordService : IRecordService
    {
        private readonly IMapper _mapper;
        private readonly IRecordRepository _repository;
        private readonly StorageClient _storageClient;
        private readonly GoogleCloudConfig _options;

        public RecordService(
            IMapper mapper,
            IRecordRepository repository,
            StorageClient storageClient,
            IOptions<GoogleCloudConfig> options)
        {
            _repository = repository;
            _storageClient = storageClient;
            _options = options.Value;
            _mapper = mapper;
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
    }
}
