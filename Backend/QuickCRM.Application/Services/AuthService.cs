using BCrypt.Net;
using QuickCRM.Application.DTOs;
using QuickCRM.Core.Interfaces;
using QuickCRM.Core.Models;

namespace QuickCRM.Application.Services
{
    /// <summary>
    /// Service for handling user authentication operations
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly JwtSettings _jwtSettings;

        public AuthService(
            IUserRepository userRepository, 
            IJwtService jwtService,
            JwtSettings jwtSettings)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
            _jwtSettings = jwtSettings ?? throw new ArgumentNullException(nameof(jwtSettings));
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            if (loginDto == null)
                throw new ArgumentNullException(nameof(loginDto));

            var user = await _userRepository.GetByEmailAsync(loginDto.Email);
            if (user == null)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return null;

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            var userDto = MapToUserDto(user);
            var token = _jwtService.GenerateToken(userDto);
            var refreshToken = _jwtService.GenerateRefreshToken();

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                User = userDto
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            if (registerDto == null)
                throw new ArgumentNullException(nameof(registerDto));

            // Check if user already exists
            var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
            if (existingUser != null)
                return null;

            // Check if username already exists
            var existingUsername = await _userRepository.GetByUsernameAsync(registerDto.Username);
            if (existingUsername != null)
                return null;

            // Create new user
            var user = new QuickCRM.Core.Entities.User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);

            var userDto = MapToUserDto(user);
            var token = _jwtService.GenerateToken(userDto);
            var refreshToken = _jwtService.GenerateRefreshToken();

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                User = userDto
            };
        }

        public async Task<bool> ValidateUserAsync(string email, string password)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return false;

            return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be null or empty", nameof(email));

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return null;

            return MapToUserDto(user);
        }

        /// <summary>
        /// Maps User entity to UserDto
        /// </summary>
        /// <param name="user">User entity</param>
        /// <returns>UserDto</returns>
        private static UserDto MapToUserDto(QuickCRM.Core.Entities.User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };
        }
    }
}
