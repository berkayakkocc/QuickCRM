using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuickCRM.Application.Services;

namespace QuickCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tüm endpoint'ler için authentication gerekli
    public class StatsController : ControllerBase
    {
        private readonly IStatsService _statsService;

        public StatsController(IStatsService statsService)
        {
            _statsService = statsService;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            var stats = await _statsService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("customers/total")]
        public async Task<ActionResult<int>> GetTotalCustomers()
        {
            var count = await _statsService.GetTotalCustomersAsync();
            return Ok(count);
        }

        [HttpGet("customers/active")]
        public async Task<ActionResult<int>> GetActiveCustomers()
        {
            var count = await _statsService.GetActiveCustomersAsync();
            return Ok(count);
        }

        [HttpGet("customers/this-month")]
        public async Task<ActionResult<int>> GetThisMonthCustomers()
        {
            var count = await _statsService.GetThisMonthCustomersAsync();
            return Ok(count);
        }
    }
}
