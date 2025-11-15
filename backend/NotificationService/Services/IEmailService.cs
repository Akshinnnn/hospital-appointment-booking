using NotificationService.Models;

namespace NotificationService.Services
{
    public interface IEmailService
    {
        Task SendAppointmentConfirmationEmailAsync(AppointmentCreatedMessage appointment);
        Task SendMedicalRecordCreatedEmailAsync(MedicalRecordCreatedMessage record, string patientEmail);
    }
}

