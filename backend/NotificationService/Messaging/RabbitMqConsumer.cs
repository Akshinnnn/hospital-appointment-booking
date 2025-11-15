using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using NotificationService.Models;
using NotificationService.Services;

namespace NotificationService.Messaging
{
    public class RabbitMqConsumer : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ConnectionFactory _factory;
        private readonly ILogger<RabbitMqConsumer> _logger;

        public RabbitMqConsumer(IConfiguration config, IServiceScopeFactory scopeFactory, ILogger<RabbitMqConsumer> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _factory = new ConnectionFactory
            {
                HostName = config["RabbitMQ:HostName"],
                UserName = config["RabbitMQ:UserName"],
                Password = config["RabbitMQ:Password"]
            };
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var connection = _factory.CreateConnection();
                    using var channel = connection.CreateModel();

                    // Declare queues
                    channel.QueueDeclare(queue: "appointment-created",
                                        durable: true,
                                        exclusive: false,
                                        autoDelete: false,
                                        arguments: null);

                    channel.QueueDeclare(queue: "medical-record-created",
                                        durable: true,
                                        exclusive: false,
                                        autoDelete: false,
                                        arguments: null);

                    // Consumer for appointment-created
                    var appointmentConsumer = new EventingBasicConsumer(channel);
                    appointmentConsumer.Received += async (sender, e) =>
                    {
                        try
                        {
                            var json = Encoding.UTF8.GetString(e.Body.ToArray());
                            var appointment = JsonSerializer.Deserialize<AppointmentCreatedMessage>(json, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            });

                            if (appointment != null)
                            {
                                using var scope = _scopeFactory.CreateScope();
                                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                                await emailService.SendAppointmentConfirmationEmailAsync(appointment);
                                _logger.LogInformation($"Processed appointment confirmation for {appointment.AppointmentNumber}");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error processing appointment-created message");
                        }
                    };

                    // Consumer for medical-record-created
                    var recordConsumer = new EventingBasicConsumer(channel);
                    recordConsumer.Received += async (sender, e) =>
                    {
                        try
                        {
                            var json = Encoding.UTF8.GetString(e.Body.ToArray());
                            var record = JsonSerializer.Deserialize<MedicalRecordCreatedMessage>(json, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            });

                            if (record != null && !string.IsNullOrEmpty(record.PatientEmail))
                            {
                                using var scope = _scopeFactory.CreateScope();
                                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                                
                                await emailService.SendMedicalRecordCreatedEmailAsync(record, record.PatientEmail);
                                _logger.LogInformation($"Processed medical record notification for record {record.Id}");
                            }
                            else
                            {
                                _logger.LogWarning($"Medical record message missing patient email for record {record?.Id}");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error processing medical-record-created message");
                        }
                    };

                    channel.BasicConsume(queue: "appointment-created",
                                         autoAck: true,
                                         consumer: appointmentConsumer);

                    channel.BasicConsume(queue: "medical-record-created",
                                         autoAck: true,
                                         consumer: recordConsumer);

                    _logger.LogInformation("RabbitMQ consumers started. Waiting for messages...");

                    // Keep the service running
                    await Task.Delay(Timeout.Infinite, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in RabbitMQ consumer. Retrying in 5 seconds...");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }
    }
}

