namespace AppointmentService.Models.DTOs.AppointmentDTOs
{
    public class AppointmentCreateDTO
    {
        public Guid DoctorId { get; set; }
        public DateTime AppointmentTime { get; set; }
        public string? Notes { get; set; }
    }
}