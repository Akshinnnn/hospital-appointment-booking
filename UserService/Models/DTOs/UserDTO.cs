using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UserService.Models.Entities;

namespace UserService.Models.DTOs
{
    public class UserDTO
    {
        public string Full_Name { get; set; }
        public string Email { get; set; }
        public string? Phone_Number { get; set; }
        public UserRole Role { get; set; }
    }
}