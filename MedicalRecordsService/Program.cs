using System.Text.Json;
using System.Text.Json.Serialization;
using Google.Cloud.Storage.V1;
using MedicalRecordService.Data;
using MedicalRecordService.Services.Repositories;
using MedicalRecordsService.GoogleCloudConfiguration;
using MedicalRecordsService.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });

builder.Services.Configure<GoogleCloudConfig>(
    builder.Configuration.GetSection("GoogleCloud"));
builder.Services.AddSingleton<StorageClient>(sp =>
{
    var options = sp.GetRequiredService<IOptions<GoogleCloudConfig>>().Value;
    return StorageClient.Create(Google.Apis.Auth.OAuth2.GoogleCredential.FromFile(options.CredentialsPath));
});
builder.Services.AddDbContext<RecordDbContext>(option =>
    option.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IRecordService, RecordService>();
builder.Services.AddScoped<IRecordRepository, RecordRepository>();
builder.Services.AddAutoMapper(typeof(Program));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.Run();
