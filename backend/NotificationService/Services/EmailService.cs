using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using NotificationService.Models;
using System;

namespace NotificationService.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendAppointmentConfirmationEmailAsync(AppointmentCreatedMessage appointment)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    _configuration["EmailSettings:SenderName"] ?? "Hospital Booking System",
                    _configuration["EmailSettings:SenderEmail"] ?? "noreply@hospitalbooking.com"));
                message.To.Add(new MailboxAddress(appointment.FullName, appointment.Email));
                message.Subject = "Appointment Confirmation";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                                <h2 style='color: #2c3e50;'>Appointment Confirmation</h2>
                                <p>Dear {appointment.FullName},</p>
                                <p>Your appointment has been successfully confirmed.</p>
                                <div style='background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                                    <p><strong>Appointment Number:</strong> {appointment.AppointmentNumber}</p>
                                    <p><strong>Appointment Date & Time:</strong> {appointment.AppointmentTime:dddd, MMMM dd, yyyy 'at' HH:mm}</p>
                                    <p><strong>Doctor ID:</strong> {appointment.DoctorId}</p>
                                    {(string.IsNullOrEmpty(appointment.Notes) ? "" : $"<p><strong>Notes:</strong> {appointment.Notes}</p>")}
                                </div>
                                <p>Please keep your appointment number <strong>{appointment.AppointmentNumber}</strong> for your records. You can use this number to access your appointment details.</p>
                                <p>If you have any questions or need to reschedule, please contact us.</p>
                                <p>Best regards,<br>Hospital Booking System</p>
                            </div>
                        </body>
                        </html>"
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _configuration["EmailSettings:SmtpHost"] ?? "smtp.gmail.com",
                    int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587"),
                    SecureSocketOptions.StartTls);

                await client.AuthenticateAsync(
                    _configuration["EmailSettings:SmtpUsername"],
                    _configuration["EmailSettings:SmtpPassword"]);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation($"Appointment confirmation email sent to {appointment.Email} for appointment {appointment.AppointmentNumber}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send appointment confirmation email to {appointment.Email}");
                // Don't throw - allow appointment creation to succeed even if email fails
                // In production, you might want to retry or use a queue
            }
        }

        public async Task SendMedicalRecordCreatedEmailAsync(MedicalRecordCreatedMessage record, string patientEmail)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    _configuration["EmailSettings:SenderName"] ?? "Hospital Booking System",
                    _configuration["EmailSettings:SenderEmail"] ?? "noreply@hospitalbooking.com"));
                message.To.Add(new MailboxAddress("Patient", patientEmail));
                message.Subject = "New Medical Record Available";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                                <h2 style='color: #2c3e50;'>New Medical Record Available</h2>
                                <p>Dear Patient,</p>
                                <p>A new medical record has been created for you.</p>
                                <div style='background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                                    <p><strong>Record Title:</strong> {record.Title ?? "N/A"}</p>
                                    <p><strong>Description:</strong> {record.Description ?? "N/A"}</p>
                                    <p><strong>Created Date:</strong> {record.CreatedAt:dddd, MMMM dd, yyyy 'at' HH:mm}</p>
                                    {(string.IsNullOrEmpty(record.FileName) ? "" : $"<p><strong>File:</strong> {record.FileName}</p>")}
                                </div>
                                <p>You can access your medical records through your patient portal.</p>
                                <p>If you have any questions, please contact us.</p>
                                <p>Best regards,<br>Hospital Booking System</p>
                            </div>
                        </body>
                        </html>"
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _configuration["EmailSettings:SmtpHost"] ?? "smtp.gmail.com",
                    int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587"),
                    SecureSocketOptions.StartTls);

                await client.AuthenticateAsync(
                    _configuration["EmailSettings:SmtpUsername"],
                    _configuration["EmailSettings:SmtpPassword"]);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation($"Medical record notification email sent to {patientEmail} for record {record.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send medical record notification email to {patientEmail}");
                throw;
            }
        }
    }
}

