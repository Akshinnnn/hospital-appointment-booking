using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UserService.Models.DTOs;

namespace UserService.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDTO dto);
        Task<string> LoginAsync(LoginDTO dto);
        Task<UserDTO> GetUserProfileAsync(Guid userId);
        Task UpdateUserAsync(Guid guid, UpdateDTO dto);
    }
}