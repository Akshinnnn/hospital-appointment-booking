using UserService.Models.Entities;

namespace UserService.Models.DTOs;

public class RegisterDTO
{
    public string Full_Name { get; set; }
    public string Email { get; set; }
    public string? Phone_Number { get; set; }
    public string Password { get; set; }
}