using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicalRecordService.Models;
using Microsoft.EntityFrameworkCore;

namespace MedicalRecordService.Data
{
    public class RecordDbContext : DbContext
    {
        public DbSet<Record> Records { get; set; }

        public RecordDbContext(DbContextOptions<RecordDbContext> options) : base(options) {}
    }
}