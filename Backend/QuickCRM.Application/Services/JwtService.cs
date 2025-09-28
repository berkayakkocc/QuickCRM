using Microsoft.IdentityModel.Tokens;
using QuickCRM.Application.DTOs;
using QuickCRM.Core.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace QuickCRM.Application.Services
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly JwtSecurityTokenHandler _tokenHandler;

        public JwtService(JwtSettings jwtSettings)
        {
            _jwtSettings = jwtSettings;
            _tokenHandler = new JwtSecurityTokenHandler();
        }

        public string GenerateToken(UserDto user)
        {
            var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = _tokenHandler.CreateToken(tokenDescriptor);
            return _tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }

        public bool ValidateToken(string token)
        {
            try
            {
                var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                _tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public UserDto? GetUserFromToken(string token)
        {
            try
            {
                var jwtToken = _tokenHandler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                var usernameClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Name);
                var emailClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email);
                var roleClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role);

                if (userIdClaim == null || usernameClaim == null || emailClaim == null || roleClaim == null)
                    return null;

                return new UserDto
                {
                    Id = int.Parse(userIdClaim.Value),
                    Username = usernameClaim.Value,
                    Email = emailClaim.Value,
                    Role = roleClaim.Value
                };
            }
            catch
            {
                return null;
            }
        }
    }
}

