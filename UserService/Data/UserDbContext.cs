using Microsoft.EntityFrameworkCore;
using UserService.Models.Entities;

namespace UserService.Data;

public class UsersDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<DoctorSchedule> Doctor_Schedules { get; set; }

    public UsersDbContext(DbContextOptions<UsersDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>(); 

        modelBuilder.Entity<DoctorSchedule>()
            .HasOne(d => d.Doctor)
            .WithMany(u => u.Availabilities)
            .HasForeignKey(d => d.Doctor_Id);    
    }
}