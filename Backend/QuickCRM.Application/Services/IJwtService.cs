using QuickCRM.Application.DTOs;

namespace QuickCRM.Application.Services
{
    public interface IJwtService
    {
        string GenerateToken(UserDto user);
        string GenerateRefreshToken();
        bool ValidateToken(string token);
        UserDto? GetUserFromToken(string token);
    }
}

