using BCrypt.Net;
using UserService.Models.Entities;

namespace UserService.Data
{
    public static class DbInitializer
    {
        public static void Seed(UsersDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Users.Any())
                return;

            var users = new List<User>
            {
                // Admin
                new User
                {
                    Full_Name = "Admin User",
                    Email = "admin@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.ADMIN,
                    Created_At = DateTime.UtcNow
                },

                // Doctors
                new User
                {
                    Full_Name = "Dr. John Smith",
                    Email = "john.smith@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Specialisation = "Cardiology",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Dr. Sarah Lee",
                    Email = "sarah.lee@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Specialisation = "Neurology",
                    Created_At = DateTime.UtcNow
                },

                // Patients
                new User
                {
                    Full_Name = "Alice Brown",
                    Email = "alice.brown@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Bob Miller",
                    Email = "bob.miller@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Created_At = DateTime.UtcNow
                }
            };

            context.Users.AddRange(users);
            context.SaveChanges();
        }
    }
}
