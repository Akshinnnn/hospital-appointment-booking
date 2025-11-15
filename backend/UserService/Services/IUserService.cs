using UserService.Models.DTOs;
using UserService.Models.Entities;
using UserService.Models.Responses;

namespace UserService.Services
{
    public interface IUserService
    {
        Task<ApiResponse<string>> RegisterAsync(RegisterDTO dto);
        Task<ApiResponse<string>> LoginAsync(LoginDTO dto);
        Task<ApiResponse<UserDTO>> GetUserProfileAsync(Guid userId);
        Task<ApiResponse<bool>> UpdateAccountAsync(Guid guid, UpdateDTO dto);
        Task<ApiResponse<bool>> UpdateUserAsync(Guid guid, User user);
        Task<ApiResponse<List<UserDTO>>> GetAllUsersAsync();
    }
}