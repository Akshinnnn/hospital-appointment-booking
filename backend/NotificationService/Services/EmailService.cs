using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using NotificationService.Models;
using System;
using System.Text.Json;

namespace NotificationService.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        private async Task<string?> GetDoctorNameAsync(Guid doctorId)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(2);
                var userServiceUrl = _configuration["UserService:BaseUrl"] ?? "http://userservice:8080";
                var url = $"{userServiceUrl}/api/user/{doctorId}";
                
                var response = await httpClient.GetAsync(url);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var apiResponse = JsonSerializer.Deserialize<JsonElement>(content);
                    
                    if (apiResponse.TryGetProperty("data", out var dataElement))
                    {
                        JsonElement fullNameElement;
                        if (dataElement.TryGetProperty("full_Name", out fullNameElement) || 
                            dataElement.TryGetProperty("fullName", out fullNameElement))
                        {
                            return fullNameElement.GetString();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch doctor name for doctor {DoctorId}", doctorId);
            }
            
            return null;
        }

        public async Task SendAppointmentConfirmationEmailAsync(AppointmentCreatedMessage appointment)
        {
            try
            {
                // Fetch doctor name if not already provided
                var doctorName = appointment.DoctorName;
                if (string.IsNullOrEmpty(doctorName))
                {
                    doctorName = await GetDoctorNameAsync(appointment.DoctorId) ?? "Dr. [Doctor Name]";
                }

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
                                    <p><strong>Doctor:</strong> {doctorName}</p>
                                    <p><strong>Appointment Date & Time:</strong> {appointment.AppointmentTime:dddd, MMMM dd, yyyy 'at' HH:mm}</p>
                                    
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
                // Fetch doctor name if not already provided
                var doctorName = record.DoctorName;
                if (string.IsNullOrEmpty(doctorName))
                {
                    doctorName = await GetDoctorNameAsync(record.Doctor_Id) ?? "Dr. [Doctor Name]";
                }

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
                                    <p><strong>Doctor:</strong> {doctorName}</p>
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

