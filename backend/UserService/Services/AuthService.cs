using AutoMapper;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserService.Models.DTOs;
using UserService.Models.Entities;
using UserService.Services.Repositories;

namespace UserService.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;

    public AuthService(
        IAuthRepository userRepository,
        IMapper mapper,
        IConfiguration configuration)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    public async Task<string> RegisterAsync(RegisterDTO dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Full_Name) || string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("Invalid user data");

        var exists = await _userRepository.ExistsAsync(dto.Full_Name, dto.Email);
        if (exists)
            throw new InvalidOperationException("Username or email already exists");

        var user = _mapper.Map<User>(dto);
        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        user.Role = UserRole.PATIENT;

        await _userRepository.AddAsync(user);

        return GenerateJwtToken(user);
    }

    public async Task<string> LoginAsync(LoginDTO dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            throw new UnauthorizedAccessException("Invalid credentials");

        return GenerateJwtToken(user);
    }

    public async Task<UserDTO> GetUserProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        return _mapper.Map<UserDTO>(user);
    }

    public async Task UpdateUserAsync(Guid guid, UpdateDTO dto)
    {
        var user = await _userRepository.GetByIdAsync(guid)
            ?? throw new KeyNotFoundException("User not found");

        var entity = _mapper.Map(dto, user);
        await _userRepository.UpdateAsync(entity);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Full_Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:ExpiryMinutes"])),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
