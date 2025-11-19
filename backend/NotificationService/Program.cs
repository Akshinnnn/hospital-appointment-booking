using NotificationService.Messaging;
using NotificationService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();
builder.Services.AddSingleton<IEmailService, EmailService>();
builder.Services.AddSingleton<RabbitMqConsumer>();

builder.Services.AddHostedService<RabbitMqConsumer>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.MapGet("/", () => "NotificationService is running.");
app.MapGet("/health", () => "OK");

app.MapControllers();

app.Run();

