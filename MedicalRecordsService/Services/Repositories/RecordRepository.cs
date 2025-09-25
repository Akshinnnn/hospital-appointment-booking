using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicalRecordsService.Data;
using MedicalRecordsService.Models;

namespace MedicalRecordsService.Services.Repositories
{
    public interface IRecordRepository
    {
        Task AddAsync(Record record);
        Task UpdateAsync(Record record);
        Task DeleteAsync(Record record);
    }

    public class RecordRepository : IRecordRepository
    {
        private readonly RecordDbContext _dbContext;

        public RecordRepository(RecordDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task AddAsync(Record record)
        {
            await _dbContext.Records.AddAsync(record);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(Record record)
        {
            _dbContext.Records.Remove(record);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(Record record)
        {
            _dbContext.Records.Update(record);
            await _dbContext.SaveChangesAsync();
        }
    }
}