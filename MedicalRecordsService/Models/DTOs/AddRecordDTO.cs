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

        public Guid Doctor_Id { get; set; }

        public string? Title { get; set; } 

        public string? Description { get; set; } 

        public string? FilePath { get; set; }

        public string? FileName { get; set; }

        public string? ContentType { get; set; } 
    }
}