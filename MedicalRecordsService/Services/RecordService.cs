using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using MedicalRecordService.Models;
using MedicalRecordService.Models.DTOs;
using MedicalRecordService.Services.Repositories;
using MedicalRecordsService.Models.DTOs;

namespace MedicalRecordsService.Services
{
    public class RecordService : IRecordService
    {
        private readonly RecordRepository _repository;
        private readonly IMapper _mapper;
        public RecordService(RecordRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task AddRecord(AddRecordDTO dto)
        {
            var record = _mapper.Map<Record>(dto);
            await _repository.AddAsync(record);
        }

        public async Task Delete(Guid id)
        {
            if (_repository.ExistsAsync(id).Result) {
                var record = await _repository.GetByIdAsync(id);
                await _repository.DeleteAsync(record);
            }
            else
            {
                throw new KeyNotFoundException("Record not found");
            }
        }

        public async Task Update(Guid id, UpdateRecordDTO dto)
        {
            if (_repository.ExistsAsync(id).Result) {
                var record = await _repository.GetByIdAsync(id);
                await _repository.UpdateAsync(record);
            }
            else
            {
                throw new KeyNotFoundException("Record not found");
            }
        }
    }
}