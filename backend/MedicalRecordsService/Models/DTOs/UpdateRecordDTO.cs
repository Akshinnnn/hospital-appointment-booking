using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalRecordsService.Models.DTOs
{
    public class UpdateRecordDTO
    {
        public string? Title { get; set; } 
        public string? Description { get; set; } 
        public string? ContentType { get; set; } 
    }
}