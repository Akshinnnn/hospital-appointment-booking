using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserService.Models.DTOs;
using UserService.Models.Entities;
using UserService.Models.Responses;
using UserService.Services.Repositories;

namespace UserService.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly IConfiguration _config;

    public UserService(IUserRepository userRepository, IMapper mapper, IConfiguration config)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _config = config;
    }

    public async Task<ApiResponse<string>> RegisterAsync(RegisterDTO dto)
    {
        var exists = await _userRepository.ExistsAsync(dto.Full_Name, dto.Email);
        if (exists)
            return ApiResponse<string>.Fail("Username or email already exists");

        var user = _mapper.Map<User>(dto);
        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        user.Role = UserRole.PATIENT;
        await _userRepository.AddAsync(user);

        var token = GenerateJwtToken(user);
        return ApiResponse<string>.Ok(token, "Registration successful");
    }

    public async Task<ApiResponse<string>> LoginAsync(LoginDTO dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return ApiResponse<string>.Fail("Invalid credentials");

        var token = GenerateJwtToken(user);
        return ApiResponse<string>.Ok(token, "Login successful");
    }

    public async Task<ApiResponse<UserDTO>> GetUserProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<UserDTO>.Fail("User not found");

        return ApiResponse<UserDTO>.Ok(_mapper.Map<UserDTO>(user));
    }

    public async Task<ApiResponse<bool>> UpdateAccountAsync(Guid userId, UpdateDTO dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<bool>.Fail("User not found");

        _mapper.Map(dto, user);
        await _userRepository.UpdateAsync(user);
        return ApiResponse<bool>.Ok(true, "Account updated successfully");
    }

    public async Task<ApiResponse<bool>> UpdateUserAsync(Guid id, User user)
    {
        var entity = await _userRepository.GetByIdAsync(id);
        if (entity == null)
            return ApiResponse<bool>.Fail("User not found");

        _mapper.Map(user, entity);
        await _userRepository.UpdateAsync(entity);
        return ApiResponse<bool>.Ok(true, "User updated successfully");
    }

    public async Task<ApiResponse<List<UserDTO>>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return ApiResponse<List<UserDTO>>.Ok(_mapper.Map<List<UserDTO>>(users));
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Full_Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_config["JwtSettings:ExpiryMinutes"])),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
