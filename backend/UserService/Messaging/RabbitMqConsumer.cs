using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using UserService.Models.Entities;
using UserService.Services.Repositories;

namespace UserService.Messaging
{
    public class RabbitMqConsumer : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ConnectionFactory _factory;

        public RabbitMqConsumer(IConfiguration config, IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
            _factory = new ConnectionFactory
            {
                HostName = config["RabbitMQ:HostName"],
                UserName = config["RabbitMQ:UserName"],
                Password = config["RabbitMQ:Password"]
            };
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var connection = _factory.CreateConnection();
            var channel = connection.CreateModel();

            channel.QueueDeclare(queue: "appointment-created",
                                durable: true,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);
            
            channel.QueueDeclare(queue: "appointment-cancelled",
                                durable: true,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);

            var createdConsumer = new EventingBasicConsumer(channel);
            createdConsumer.Received += async (sender, e) =>
            {
                var json = Encoding.UTF8.GetString(e.Body.ToArray());
                var appointment = JsonSerializer.Deserialize<Appointment>(json);

                if (appointment != null)
                {
                    using var scope = _scopeFactory.CreateScope();
                    var slotRepo = scope.ServiceProvider.GetRequiredService<ISlotRepository>();

                    var slot = await slotRepo.GetSlots(appointment.DoctorId, appointment.AppointmentTime.Date);
                    var match = slot.FirstOrDefault(s => s.Start == appointment.AppointmentTime);

                    if (match != null)
                    {
                        match.IsAvailable = false;
                        await slotRepo.UpdateSlotAsync(match);
                    }
                }
            };

            channel.BasicConsume(queue: "appointment-created",
                                 autoAck: true,
                                 consumer: createdConsumer);

            var cancelledConsumer = new EventingBasicConsumer(channel);
            cancelledConsumer.Received += async (sender, e) =>
            {
                var json = Encoding.UTF8.GetString(e.Body.ToArray());
                var appointment = JsonSerializer.Deserialize<Appointment>(json);

                if (appointment != null)
                {
                    using var scope = _scopeFactory.CreateScope();
                    var slotRepo = scope.ServiceProvider.GetRequiredService<ISlotRepository>();

                    var slot = await slotRepo.GetSlots(appointment.DoctorId, appointment.AppointmentTime.Date);
                    var match = slot.FirstOrDefault(s => s.Start == appointment.AppointmentTime);

                    if (match != null)
                    {
                        match.IsAvailable = true; 
                        await slotRepo.UpdateSlotAsync(match);
                    }
                }
            };

            channel.BasicConsume(queue: "appointment-cancelled",
                                 autoAck: true,
                                 consumer: cancelledConsumer);

            return Task.CompletedTask;
        }
    }
}
