using Microsoft.EntityFrameworkCore;
using QuickCRM.Core.Entities;
using QuickCRM.Core.Interfaces;
using QuickCRM.Infrastructure.Data;

namespace QuickCRM.Infrastructure.Repositories
{
    public class CustomerNoteRepository : Repository<CustomerNote>, ICustomerNoteRepository
    {
        public CustomerNoteRepository(QuickCRMDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<CustomerNote>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.CustomerNotes
                .Where(n => n.CustomerId == customerId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<CustomerNote>> GetByCustomerIdAndCreatedByAsync(int customerId, string createdBy)
        {
            return await _context.CustomerNotes
                .Where(n => n.CustomerId == customerId && n.CreatedBy == createdBy)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetCountByCustomerIdAsync(int customerId)
        {
            return await _context.CustomerNotes
                .CountAsync(n => n.CustomerId == customerId);
        }

        public async Task<IEnumerable<CustomerNote>> GetActiveByCustomerIdAsync(int customerId)
        {
            return await _context.CustomerNotes
                .Where(n => n.CustomerId == customerId && n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
    }
}
