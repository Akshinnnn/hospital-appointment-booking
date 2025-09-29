using AppointmentService.Models.Entities;

namespace AppointmentService.Models.DTOs.AppointmentDTOs
{
    public class AppointmentDTO
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public Guid PatientId { get; set; }
        public DateTime AppointmentTime { get; set; }
        public AppointmentStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}