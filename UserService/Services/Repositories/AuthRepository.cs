using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models.Entities;

namespace UserService.Services.Repositories;

public interface IAuthRepository
{
    Task<User> GetByUsernameAsync(string name);
    Task<User> GetByEmailAsync(string email);
    Task<User> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(string name, string email);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(User user);
}

public class AuthRepository : IAuthRepository
{
    private readonly UsersDbContext _dbContext;

    public AuthRepository(UsersDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<User> GetByUsernameAsync(string name)
    {
        return await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Full_Name == name);
    }

    public async Task<User> GetByIdAsync(Guid id)
    {
        return await _dbContext.Users.FindAsync(id);
    }

    public async Task<bool> ExistsAsync(string name, string email)
    {
        return await _dbContext.Users
            .AnyAsync(u => u.Full_Name == name || u.Email == email);
    }

    public async Task AddAsync(User user)
    {
        await _dbContext.Users.AddAsync(user);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(User user)
    {
        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<User> GetByEmailAsync(string email)
    {
        return await _dbContext.Users.
                        FirstOrDefaultAsync(u => u.Email == email);
    }
}