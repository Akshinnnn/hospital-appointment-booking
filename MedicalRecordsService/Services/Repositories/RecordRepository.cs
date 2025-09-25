using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicalRecordsService.Models;

namespace MedicalRecordsService.Services.Repositories
{
    public interface IRecordRepository
    {
        Task AddAsync(Record user);
        Task UpdateAsync(Record user);
        Task DeleteAsync(Record user);
    }

    public class RecordRepository : IRecordRepository
    {
        public Task AddAsync(Record user)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(Record user)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(Record user)
        {
            throw new NotImplementedException();
        }
    }
}