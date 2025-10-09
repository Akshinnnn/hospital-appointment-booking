namespace AppointmentService.Models.DTOs.AppointmentDTOs
{
    public class AppointmentCreateDTO
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public Guid DoctorId { get; set; }
        public DateTime AppointmentTime { get; set; }
        public string? Notes { get; set; }
    }
}