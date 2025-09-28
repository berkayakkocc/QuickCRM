using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace QuickCRM.Infrastructure.Data
{
    public class QuickCRMDbContextFactory : IDesignTimeDbContextFactory<QuickCRMDbContext>
    {
        public QuickCRMDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<QuickCRMDbContext>();

            // Development için local connection string
            optionsBuilder.UseSqlServer(
    "Server=localhost\\SQLEXPRESS;Database=QuickCRM;Trusted_Connection=true;TrustServerCertificate=true;"
);


            return new QuickCRMDbContext(optionsBuilder.Options);
        }
    }
}
