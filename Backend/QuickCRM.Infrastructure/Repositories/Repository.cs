using Microsoft.EntityFrameworkCore;
using QuickCRM.Core.Interfaces;
using QuickCRM.Infrastructure.Data;
using System.Linq.Expressions;

namespace QuickCRM.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly QuickCRMDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(QuickCRMDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public virtual async Task<bool> ExistsAsync(int id)
        {
            return await _dbSet.FindAsync(id) != null;
        }

        public virtual async Task<int> CountAsync()
        {
            return await _dbSet.CountAsync();
        }
    }
}
