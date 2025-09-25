using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalRecordService.Models
{
    public class Record
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid Patient_Id { get; set; }

        [Required]
        public Guid Doctor_Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string? Title { get; set; } 

        [MaxLength(500)]
        public string? Description { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? FilePath { get; set; }

        [MaxLength(100)]
        public string? FileName { get; set; }

        [MaxLength(50)]
        public string? ContentType { get; set; } 
    }
}