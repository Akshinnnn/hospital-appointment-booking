using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Google.Cloud.Storage.V1;
using MedicalRecordService.Data;
using MedicalRecordService.Services.Repositories;
using MedicalRecordsService.GoogleCloudConfiguration;
using MedicalRecordsService.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using FluentValidation.AspNetCore;
using MedicalRecordsService.Validators;

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
builder.Services.AddSingleton<MedicalRecordsService.Messaging.IRabbitMqProducer, MedicalRecordsService.Messaging.RabbitMqProducer>();
builder.Services.AddHttpClient();
builder.Services.AddAutoMapper(typeof(Program));

builder.Services.AddValidatorsFromAssemblyContaining<AddRecordValidator>();
builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddAuthorization();

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = builder.Configuration["JwtSettings:Issuer"];
        options.RequireHttpsMetadata = false;
        options.Audience = builder.Configuration["JwtSettings:Audience"];

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]))
        };
    });

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RecordDbContext>();
    db.Database.Migrate(); 
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseHttpsRedirection();
}

app.UseMiddleware<ExceptionMiddleware>();
app.MapGet("/", () => "MedicalRecordService is running.");

app.UseAuthentication();  
app.UseAuthorization(); 

app.MapControllers();

app.Run();
