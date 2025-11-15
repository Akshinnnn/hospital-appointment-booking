using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicalRecordService.Models;
using MedicalRecordService.Models.DTOs;
using MedicalRecordsService.Models.DTOs;
using MedicalRecordsService.Models.Responses;

namespace MedicalRecordsService.Services
{
    public interface IRecordService
    {
        Task<ApiResponse<Record>> AddRecord(Guid id, AddRecordDTO dto);
        Task<ApiResponse<Record>> GetById(Guid id);
        Task<ApiResponse<List<Record>>> GetMyRecords(Guid userId, string role);
        Task<ApiResponse<Record>> Update(Guid id, UpdateRecordDTO dto);
        Task<ApiResponse<string>> Delete(Guid id);
    }
}