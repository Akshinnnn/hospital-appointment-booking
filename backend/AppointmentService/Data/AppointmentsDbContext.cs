using System;
using AppointmentService.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AppointmentService.Data;

public class AppointmentsDbContext : DbContext
{
    public AppointmentsDbContext(DbContextOptions<AppointmentsDbContext> options) : base(options) { }

    public DbSet<Appointment> Appointments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),  
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc) 
        );

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
            }
        }

        modelBuilder.Entity<Appointment>()
        .Property(a => a.Status)
        .HasDefaultValue(AppointmentStatus.APPROVED);
        
        modelBuilder.Entity<Appointment>()
        .HasIndex(a => new { a.DoctorId, a.AppointmentTime })
        .IsUnique();

    }
}