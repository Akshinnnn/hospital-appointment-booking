using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalRecordService.Models.DTOs
{
    public class AddRecordDTO
    {
        public Guid Patient_Id { get; set; }
        public string? Title { get; set; } = default!;
        public string? Description { get; set; } 
        public IFormFile File { get; set; } = default!;
    }
}