using UserService.Models.DTOs;

namespace UserService.Services
{
    public interface IUserService
    {
        Task<string> RegisterAsync(RegisterDTO dto);
        Task<string> LoginAsync(LoginDTO dto);
        Task<UserDTO> GetUserProfileAsync(Guid userId);
        Task UpdateUserAsync(Guid guid, UpdateDTO dto);
    }
}