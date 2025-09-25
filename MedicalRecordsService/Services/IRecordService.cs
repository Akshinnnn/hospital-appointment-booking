using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicalRecordService.Models.DTOs;
using MedicalRecordsService.Models.DTOs;

namespace MedicalRecordsService.Services
{
    public interface IRecordService
    {
        Task AddRecord(AddRecordDTO dto);
        Task Update(Guid id, UpdateRecordDTO dto);
        Task Delete(Guid id);
    }
}