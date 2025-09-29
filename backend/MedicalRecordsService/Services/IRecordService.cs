using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicalRecordService.Models;
using MedicalRecordService.Models.DTOs;
using MedicalRecordsService.Models.DTOs;

namespace MedicalRecordsService.Services
{
    public interface IRecordService
    {
        Task<Record> AddRecord(Guid id, AddRecordDTO dto);
        Task<Record?> GetById(Guid id);
        Task<List<Record>> GetMyRecords(Guid userId, string role);
        Task<Record> Update(Guid id, UpdateRecordDTO dto);
        Task Delete(Guid id);
    }
}