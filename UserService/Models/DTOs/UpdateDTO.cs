using UserService.Models.Entities;

namespace UserService.Models.DTOs;

public class UpdateDTO
{
    public string? Full_Name { get; set; }
    public string? Email { get; set; }
    public string? Phone_Number { get; set; }
}