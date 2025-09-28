using Microsoft.EntityFrameworkCore;
using QuickCRM.Core.Entities;
using QuickCRM.Core.Interfaces;
using QuickCRM.Infrastructure.Data;

namespace QuickCRM.Infrastructure.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(QuickCRMDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> ValidateCredentialsAsync(string username, string password)
        {
            var user = await GetByUsernameAsync(username);
            if (user == null) return false;

            return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        }
    }
}
