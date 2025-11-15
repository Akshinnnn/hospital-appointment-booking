namespace NotificationService.Models
{
    public class AppointmentCreatedMessage
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public Guid? PatientId { get; set; }
        public DateTime AppointmentTime { get; set; }
        public string AppointmentNumber { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

