using UserService.Models.Entities;

namespace UserService.Models.DTOs;

public class CreateDoctorDTO
{
    public string Full_Name { get; set; }
    public string Email { get; set; }
    public string? Phone_Number { get; set; }
    public string Password { get; set; }
    public UserRole Role { get; set; } = UserRole.DOCTOR;
    public string Specialisation { get; set; }
}