using QuickCRM.Core.Entities;

namespace QuickCRM.Core.Interfaces
{
    public interface ICustomerRepository : IRepository<Customer>
    {
        Task<IEnumerable<Customer>> SearchAsync(string searchTerm);
        Task<IEnumerable<Customer>> GetActiveCustomersAsync();
        Task<Customer?> GetByEmailAsync(string email);
        Task<int> GetCountAsync();
        Task<int> GetActiveCountAsync();
        Task<int> GetThisMonthCountAsync();
    }
}
