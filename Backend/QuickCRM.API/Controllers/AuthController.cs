using Microsoft.AspNetCore.Mvc;
using QuickCRM.Application.DTOs;
using QuickCRM.Application.Services;

namespace QuickCRM.API.Controllers
{
    /// <summary>
    /// Authentication controller for user login, registration and validation
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Authenticates a user and returns JWT token
        /// </summary>
        /// <param name="loginDto">User login credentials</param>
        /// <returns>JWT token and user information</returns>
        /// <response code="200">Login successful</response>
        /// <response code="401">Invalid credentials</response>
        /// <response code="400">Invalid request data</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Login attempt with invalid model state");
                return BadRequest(ModelState);
            }

            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", loginDto.Email);
                
                var result = await _authService.LoginAsync(loginDto);
                if (result == null)
                {
                    _logger.LogWarning("Failed login attempt for email: {Email}", loginDto.Email);
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                _logger.LogInformation("Successful login for user: {UserId}", result.User.Id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        /// <summary>
        /// Registers a new user
        /// </summary>
        /// <param name="registerDto">User registration data</param>
        /// <returns>JWT token and user information</returns>
        /// <response code="200">Registration successful</response>
        /// <response code="400">User already exists or invalid data</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Registration attempt with invalid model state");
                return BadRequest(ModelState);
            }

            try
            {
                _logger.LogInformation("Registration attempt for email: {Email}", registerDto.Email);
                
                var result = await _authService.RegisterAsync(registerDto);
                if (result == null)
                {
                    _logger.LogWarning("Registration failed - user already exists for email: {Email}", registerDto.Email);
                    return BadRequest(new { message = "User already exists with this email or username" });
                }

                _logger.LogInformation("Successful registration for user: {UserId}", result.User.Id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", registerDto.Email);
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        /// <summary>
        /// Validates user credentials without returning a token
        /// </summary>
        /// <param name="loginDto">User credentials to validate</param>
        /// <returns>Validation result</returns>
        [HttpPost("validate")]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<bool>> ValidateUser([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var isValid = await _authService.ValidateUserAsync(loginDto.Email, loginDto.Password);
                return Ok(isValid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user validation for email: {Email}", loginDto.Email);
                return StatusCode(500, new { message = "An error occurred during validation" });
            }
        }
    }
}
