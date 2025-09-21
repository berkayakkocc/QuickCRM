namespace QuickCRM.Application.Services
{
    public interface IStatsService
    {
        Task<object> GetDashboardStatsAsync();
        Task<int> GetTotalCustomersAsync();
        Task<int> GetActiveCustomersAsync();
        Task<int> GetThisMonthCustomersAsync();
    }
}
