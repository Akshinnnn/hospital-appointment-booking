using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace MedicalRecordsService.Messaging
{
    public interface IRabbitMqProducer
    {
        void Publish<T>(string queueName, T message);
    }

    public class RabbitMqProducer : IRabbitMqProducer
    {
        private readonly ConnectionFactory _factory;
        private readonly IConfiguration _configuration;

        public RabbitMqProducer(IConfiguration configuration)
        {
            _configuration = configuration;
            _factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMQ:HostName"],
                UserName = _configuration["RabbitMQ:UserName"],
                Password = _configuration["RabbitMQ:Password"]
            };
        }

        public void Publish<T>(string queueName, T message)
        {
            using var connection = _factory.CreateConnection();
            using var channel = connection.CreateModel();

            channel.QueueDeclare(queue: queueName,
                                durable: true,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);

            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

            channel.BasicPublish(exchange: "",
                                 routingKey: queueName,
                                 basicProperties: null,
                                 body: body);
        }
    }
}

