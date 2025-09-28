using QuickCRM.Core.Entities;

namespace QuickCRM.Core.Interfaces
{
    public interface ICustomerNoteRepository : IRepository<CustomerNote>
    {
        Task<IEnumerable<CustomerNote>> GetByCustomerIdAsync(int customerId);
        Task<IEnumerable<CustomerNote>> GetByCustomerIdAndCreatedByAsync(int customerId, string createdBy);
        Task<int> GetCountByCustomerIdAsync(int customerId);
        Task<IEnumerable<CustomerNote>> GetActiveByCustomerIdAsync(int customerId);
    }
}
