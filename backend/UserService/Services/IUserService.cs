using UserService.Models.DTOs;
using UserService.Models.Entities;

namespace UserService.Services
{
    public interface IUserService
    {
        Task<string> RegisterAsync(RegisterDTO dto);
        Task<string> LoginAsync(LoginDTO dto);
        Task<UserDTO> GetUserProfileAsync(Guid userId);
        Task UpdateAccountAsync(Guid guid, UpdateDTO dto);
        Task UpdateUserAsync(Guid guid, User user);
        Task<List<UserDTO>> GetAllUsersAsync();
        Task<User> GetByIdAsync(Guid userId);
    }
}