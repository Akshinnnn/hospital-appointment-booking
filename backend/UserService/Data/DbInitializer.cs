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
                // ============= ADMINS =============
                new User
                {
                    Full_Name = "Admin User",
                    Email = "admin@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.ADMIN,
                    Phone_Number = "+1-555-0100",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Maria Rodriguez",
                    Email = "maria.rodriguez@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.ADMIN,
                    Phone_Number = "+1-555-0101",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "James Wilson",
                    Email = "james.wilson@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.ADMIN,
                    Phone_Number = "+1-555-0102",
                    Created_At = DateTime.UtcNow
                },

                // ============= DOCTORS =============
                new User
                {
                    Full_Name = "John Smith",
                    Email = "john.smith@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0201",
                    Specialisation = "Cardiology",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Sarah Lee",
                    Email = "sarah.lee@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0202",
                    Specialisation = "Neurology",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Michael Chen",
                    Email = "michael.chen@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0203",
                    Specialisation = "Pediatrics",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Emily Davis",
                    Email = "emily.davis@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0204",
                    Specialisation = "Dermatology",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Robert Johnson",
                    Email = "robert.johnson@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0205",
                    Specialisation = "Orthopedics",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Lisa Martinez",
                    Email = "lisa.martinez@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0206",
                    Specialisation = "Psychiatry",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "David Kim",
                    Email = "david.kim@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0207",
                    Specialisation = "Ophthalmology",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Jennifer Brown",
                    Email = "jennifer.brown@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0208",
                    Specialisation = "Gastroenterology",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "William Taylor",
                    Email = "william.taylor@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0209",
                    Specialisation = "Oncology",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Amanda White",
                    Email = "amanda.white@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("doctor123"),
                    Role = UserRole.DOCTOR,
                    Phone_Number = "+1-555-0210",
                    Specialisation = "Endocrinology",
                    Created_At = DateTime.UtcNow
                },

                // ============= PATIENTS =============
                new User
                {
                    Full_Name = "Alice Brown",
                    Email = "alice.brown@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0301",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Bob Miller",
                    Email = "bob.miller@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0302",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Charlie Anderson",
                    Email = "charlie.anderson@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0303",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Diana Thompson",
                    Email = "diana.thompson@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0304",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Edward Garcia",
                    Email = "edward.garcia@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0305",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Fiona Martinez",
                    Email = "fiona.martinez@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0306",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "George Wilson",
                    Email = "george.wilson@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0307",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Hannah Davis",
                    Email = "hannah.davis@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0308",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Isaac Rodriguez",
                    Email = "isaac.rodriguez@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0309",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Julia Harris",
                    Email = "julia.harris@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0310",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Kevin Clark",
                    Email = "kevin.clark@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0311",
                    Created_At = DateTime.UtcNow
                },
                new User
                {
                    Full_Name = "Laura Lewis",
                    Email = "laura.lewis@hospital.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("patient123"),
                    Role = UserRole.PATIENT,
                    Phone_Number = "+1-555-0312",
                    Created_At = DateTime.UtcNow
                }
            };

            context.Users.AddRange(users);
            context.SaveChanges();

            // ============= CREATE DOCTOR SCHEDULES AND SLOTS =============
            var doctors = users.Where(u => u.Role == UserRole.DOCTOR).ToList();
            var schedules = new List<DoctorSchedule>();
            var slots = new List<Slot>();

            // Get the start of next week (Monday)
            var today = DateTime.UtcNow.Date;
            var daysUntilMonday = ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7;
            if (daysUntilMonday == 0 && today.DayOfWeek != DayOfWeek.Monday)
                daysUntilMonday = 7;
            var nextMonday = today.AddDays(daysUntilMonday);

            foreach (var doctor in doctors)
            {
                // Create schedules for the next 2 weeks (10 working days)
                for (int day = 0; day < 10; day++)
                {
                    var scheduleDate = nextMonday.AddDays(day);
                    
                    // Skip weekends
                    if (scheduleDate.DayOfWeek == DayOfWeek.Saturday || scheduleDate.DayOfWeek == DayOfWeek.Sunday)
                        continue;

                    // Morning shift: 9 AM - 12 PM
                    var morningStart = DateTime.SpecifyKind(scheduleDate.AddHours(9), DateTimeKind.Utc);
                    var morningEnd = DateTime.SpecifyKind(scheduleDate.AddHours(12), DateTimeKind.Utc);

                    var morningSchedule = new DoctorSchedule
                    {
                        Doctor_Id = doctor.Id,
                        Start_Time = morningStart,
                        End_Time = morningEnd
                    };
                    schedules.Add(morningSchedule);

                    // Create 30-minute slots for morning
                    var currentSlot = morningStart;
                    while (currentSlot < morningEnd)
                    {
                        slots.Add(new Slot
                        {
                            DoctorId = doctor.Id,
                            Start = currentSlot,
                            End = currentSlot.AddMinutes(30),
                            IsAvailable = true
                        });
                        currentSlot = currentSlot.AddMinutes(30);
                    }

                    // Afternoon shift: 2 PM - 5 PM
                    var afternoonStart = DateTime.SpecifyKind(scheduleDate.AddHours(14), DateTimeKind.Utc);
                    var afternoonEnd = DateTime.SpecifyKind(scheduleDate.AddHours(17), DateTimeKind.Utc);

                    var afternoonSchedule = new DoctorSchedule
                    {
                        Doctor_Id = doctor.Id,
                        Start_Time = afternoonStart,
                        End_Time = afternoonEnd
                    };
                    schedules.Add(afternoonSchedule);

                    // Create 30-minute slots for afternoon
                    currentSlot = afternoonStart;
                    while (currentSlot < afternoonEnd)
                    {
                        slots.Add(new Slot
                        {
                            DoctorId = doctor.Id,
                            Start = currentSlot,
                            End = currentSlot.AddMinutes(30),
                            IsAvailable = true
                        });
                        currentSlot = currentSlot.AddMinutes(30);
                    }
                }
            }

            context.Doctor_Schedules.AddRange(schedules);
            context.Slots.AddRange(slots);
            context.SaveChanges();
        }
    }
}
