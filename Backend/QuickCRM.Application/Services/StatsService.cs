using Microsoft.Extensions.Caching.Memory;

namespace QuickCRM.Application.Services
{
    public class StatsService : IStatsService
    {
        private readonly ICustomerService _customerService;
        private readonly IMemoryCache _cache;
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5); // 5 dakika cache

        public StatsService(ICustomerService customerService, IMemoryCache cache)
        {
            _customerService = customerService;
            _cache = cache;
        }

        public async Task<object> GetDashboardStatsAsync()
        {
            const string cacheKey = "dashboard_stats";
            
            if (_cache.TryGetValue(cacheKey, out object? cachedStats))
            {
                return cachedStats!;
            }

            var stats = await _customerService.GetCustomerStatsAsync();
            
            _cache.Set(cacheKey, stats, _cacheExpiration);
            
            return stats;
        }

        public async Task<int> GetTotalCustomersAsync()
        {
            const string cacheKey = "total_customers";
            
            if (_cache.TryGetValue(cacheKey, out int cachedCount))
            {
                return cachedCount;
            }

            var count = await _customerService.GetCustomerCountAsync();
            
            _cache.Set(cacheKey, count, _cacheExpiration);
            
            return count;
        }

        public async Task<int> GetActiveCustomersAsync()
        {
            const string cacheKey = "active_customers";
            
            if (_cache.TryGetValue(cacheKey, out int cachedCount))
            {
                return cachedCount;
            }

            var count = await _customerService.GetActiveCustomerCountAsync();
            
            _cache.Set(cacheKey, count, _cacheExpiration);
            
            return count;
        }

        public async Task<int> GetThisMonthCustomersAsync()
        {
            const string cacheKey = "this_month_customers";
            
            if (_cache.TryGetValue(cacheKey, out int cachedCount))
            {
                return cachedCount;
            }

            var count = await _customerService.GetThisMonthCustomerCountAsync();
            
            _cache.Set(cacheKey, count, _cacheExpiration);
            
            return count;
        }
    }
}
