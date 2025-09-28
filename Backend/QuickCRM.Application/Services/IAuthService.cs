using QuickCRM.Application.DTOs;

namespace QuickCRM.Application.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
        Task<bool> ValidateUserAsync(string email, string password);
        Task<UserDto?> GetUserByEmailAsync(string email);
    }
}

