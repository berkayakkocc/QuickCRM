using Microsoft.EntityFrameworkCore;
using QuickCRM.Core.Entities;
using QuickCRM.Infrastructure.Data;

namespace QuickCRM.API.Data
{
    public static class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new QuickCRMDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<QuickCRMDbContext>>());

            if (context.Customers.Any())
            {
                return; // Veri zaten var
            }

            var customers = new List<Customer>
            {
                new Customer
                {
                    FirstName = "Ahmet",
                    LastName = "Yılmaz",
                    Email = "ahmet.yilmaz@example.com",
                    Phone = "0532 123 45 67",
                    Company = "ABC Teknoloji",
                    Notes = "Potansiyel müşteri",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Customer
                {
                    FirstName = "Ayşe",
                    LastName = "Demir",
                    Email = "ayse.demir@example.com",
                    Phone = "0533 987 65 43",
                    Company = "XYZ Yazılım",
                    Notes = "Aktif müşteri",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Customer
                {
                    FirstName = "Mehmet",
                    LastName = "Kaya",
                    Email = "mehmet.kaya@example.com",
                    Phone = "0534 555 44 33",
                    Company = "DEF Danışmanlık",
                    Notes = "Eski müşteri",
                    IsActive = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                }
            };

            context.Customers.AddRange(customers);
            context.SaveChanges();
        }
    }
}
