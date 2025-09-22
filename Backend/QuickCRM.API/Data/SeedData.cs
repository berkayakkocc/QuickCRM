using Microsoft.EntityFrameworkCore;
using QuickCRM.Core.Entities;
using QuickCRM.Infrastructure.Data;

namespace QuickCRM.API.Data
{
    public static class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            var maxRetries = 5;
            var retryDelay = TimeSpan.FromSeconds(10);
            
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    using var context = new QuickCRMDbContext(
                        serviceProvider.GetRequiredService<DbContextOptions<QuickCRMDbContext>>());

                    // Database bağlantısını test et
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
                    
                    // Başarılı oldu, döngüden çık
                    return;
                }
                catch (Exception ex) when (IsTransientError(ex) && attempt < maxRetries)
                {
                    // Transient hata (40613 - Database not available)
                    Console.WriteLine($"Seed data attempt {attempt} failed: {ex.Message}");
                    Console.WriteLine($"Retrying in {retryDelay.TotalSeconds} seconds...");
                    Thread.Sleep(retryDelay);
                }
                catch (Exception ex)
                {
                    // Son deneme veya non-transient hata
                    Console.WriteLine($"Seed data failed after {attempt} attempts: {ex.Message}");
                    throw;
                }
            }
        }

        private static bool IsTransientError(Exception ex)
        {
            // Azure SQL Serverless auto-pause hatası (40613)
            if (ex.Message.Contains("40613") || ex.Message.Contains("Database is not currently available"))
                return true;
                
            // Diğer transient hatalar
            if (ex.Message.Contains("timeout") || ex.Message.Contains("connection"))
                return true;
                
            return false;
        }
    }
}
