using Microsoft.EntityFrameworkCore;
using QuickCRM.Core.Entities;
using QuickCRM.Core.Interfaces;
using QuickCRM.Infrastructure.Data;

namespace QuickCRM.Infrastructure.Repositories
{
    public class CustomerRepository : Repository<Customer>, ICustomerRepository
    {
        public CustomerRepository(QuickCRMDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Customer>> SearchAsync(string searchTerm)
        {
            return await _dbSet
                .Where(c => c.IsActive && (
                    c.FirstName.Contains(searchTerm) ||
                    c.LastName.Contains(searchTerm) ||
                    c.Email.Contains(searchTerm) ||
                    c.Company!.Contains(searchTerm)
                ))
                .OrderBy(c => c.FirstName)
                .ThenBy(c => c.LastName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Customer>> GetActiveCustomersAsync()
        {
            return await _dbSet
                .Where(c => c.IsActive)
                .OrderBy(c => c.FirstName)
                .ThenBy(c => c.LastName)
                .ToListAsync();
        }

        public async Task<Customer?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.Email == email);
        }

        public async Task<int> GetCountAsync()
        {
            return await _dbSet.CountAsync();
        }

        public async Task<int> GetActiveCountAsync()
        {
            return await _dbSet.CountAsync(c => c.IsActive);
        }

        public async Task<int> GetThisMonthCountAsync()
        {
            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            return await _dbSet.CountAsync(c => c.CreatedAt >= startOfMonth);
        }
    }
}
