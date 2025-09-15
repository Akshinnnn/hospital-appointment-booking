using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace AppointmentService.Models.Entities
{
    [Table("Appointments")]
    public class Appointment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid DoctorId { get; set; }

        [Required]
        public Guid PatientId { get; set; }

        [Required]
        public Guid ScheduleId { get; set; }

        [Required]
        public DateTime AppointmentTime { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.PENDING;

        public string? Notes { get; set; }
        
    }
}