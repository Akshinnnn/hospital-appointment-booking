using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentService.Models.Entities
{
    [Table("Appointments")]
    public class Appointment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string FullName { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public Guid DoctorId { get; set; }

        public Guid? PatientId { get; set; }

        [Required]
        public DateTime AppointmentTime { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.APPROVED;

        public string? Notes { get; set; }
        
    }
}