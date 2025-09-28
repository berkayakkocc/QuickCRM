using Microsoft.EntityFrameworkCore;
using QuickCRM.Core.Entities;
using QuickCRM.Infrastructure.Data;
using BCrypt.Net;

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
                    Console.WriteLine("Checking existing data...");

                    // Default Users - sadece eksik olanları ekle
                    var existingUsers = context.Users.ToList();
                    var usersToAdd = new List<User>();
                    
                    var defaultUsers = new[]
                    {
                        new { Username = "admin", Email = "admin@quickcrm.com", Password = "Admin123!", Role = "Admin" },
                        new { Username = "manager", Email = "manager@quickcrm.com", Password = "Manager123!", Role = "Manager" },
                        new { Username = "user", Email = "user@quickcrm.com", Password = "User123!", Role = "User" },
                        new { Username = "demo", Email = "demo@quickcrm.com", Password = "Demo123!", Role = "User" }
                    };

                    foreach (var userData in defaultUsers)
                    {
                        if (!existingUsers.Any(u => u.Username == userData.Username || u.Email == userData.Email))
                        {
                            usersToAdd.Add(new User
                            {
                                Username = userData.Username,
                                Email = userData.Email,
                                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userData.Password),
                                Role = userData.Role,
                                CreatedAt = DateTime.UtcNow,
                                LastLoginAt = DateTime.UtcNow
                            });
                        }
                    }

                    if (usersToAdd.Any())
                    {
                        context.Users.AddRange(usersToAdd);
                        context.SaveChanges();
                        Console.WriteLine($"Added {usersToAdd.Count} new users.");
                    }
                    else
                    {
                        Console.WriteLine("All default users already exist.");
                    }
                    
                    // Default Customers - sadece eksik olanları ekle
                    var existingCustomers = context.Customers.ToList();
                    var customersToAdd = new List<Customer>();
                    
                    var defaultCustomers = new[]
                    {
                        new { FirstName = "Ahmet", LastName = "Yılmaz", Email = "ahmet.yilmaz@example.com", Phone = "0532 123 45 67", Company = "ABC Teknoloji", Notes = "VIP müşteri, özel indirim uygulanabilir" },
                        new { FirstName = "Ayşe", LastName = "Demir", Email = "ayse.demir@example.com", Phone = "0533 987 65 43", Company = "XYZ Ltd.", Notes = "Yeni müşteri, takip edilmeli" },
                        new { FirstName = "Mehmet", LastName = "Kaya", Email = "mehmet.kaya@example.com", Phone = "0534 555 44 33", Company = "Kaya İnşaat", Notes = "Büyük proje potansiyeli" },
                        new { FirstName = "Fatma", LastName = "Özkan", Email = "fatma.ozkan@example.com", Phone = "0535 777 88 99", Company = "Özkan Ticaret", Notes = "Düzenli müşteri, güvenilir" },
                        new { FirstName = "Ali", LastName = "Çelik", Email = "ali.celik@example.com", Phone = "0536 111 22 33", Company = "Çelik Metal", Notes = "Potansiyel müşteri, değerlendirilmeli" }
                    };

                    foreach (var customerData in defaultCustomers)
                    {
                        if (!existingCustomers.Any(c => c.Email == customerData.Email))
                        {
                            customersToAdd.Add(new Customer
                            {
                                FirstName = customerData.FirstName,
                                LastName = customerData.LastName,
                                Email = customerData.Email,
                                Phone = customerData.Phone,
                                Company = customerData.Company,
                                Notes = customerData.Notes,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                                IsActive = true
                            });
                        }
                    }

                    if (customersToAdd.Any())
                    {
                        context.Customers.AddRange(customersToAdd);
                        context.SaveChanges();
                        Console.WriteLine($"Added {customersToAdd.Count} new customers.");
                    }
                    else
                    {
                        Console.WriteLine("All default customers already exist.");
                    }
                    
                    // Customer Notes - sadece eksik olanları ekle
                    var allCustomers = context.Customers.ToList();
                    var existingNotes = context.CustomerNotes.ToList();
                    var notesToAdd = new List<CustomerNote>();
                    
                    // Her müşteri için varsayılan notlar
                    var defaultNotes = new[]
                    {
                        new { Email = "ahmet.yilmaz@example.com", Content = "Müşteri ile ilk görüşme yapıldı. Çok ilgili ve proaktif bir yaklaşım sergiliyor. Teknoloji konularında bilgili.", CreatedBy = "admin", DaysAgo = 5 },
                        new { Email = "ahmet.yilmaz@example.com", Content = "Fiyat teklifi gönderildi. Müşteri 2 gün içinde geri dönüş yapacak. Takip edilmeli.", CreatedBy = "manager", DaysAgo = 2 },
                        new { Email = "ayse.demir@example.com", Content = "Yeni müşteri kaydı oluşturuldu. İlk temas kuruldu, detaylı bilgi toplanacak.", CreatedBy = "user", DaysAgo = 3 },
                        new { Email = "ayse.demir@example.com", Content = "Müşteri ihtiyaçları belirlendi. CRM sistemi hakkında bilgi verildi.", CreatedBy = "admin", DaysAgo = 1 },
                        new { Email = "mehmet.kaya@example.com", Content = "Büyük inşaat projesi için görüşme yapıldı. Potansiyel değer: 500K+ TL", CreatedBy = "manager", DaysAgo = 7 },
                        new { Email = "mehmet.kaya@example.com", Content = "Teknik ekip ile detaylı görüşme planlandı. Önümüzdeki hafta toplantı yapılacak.", CreatedBy = "admin", DaysAgo = 4 },
                        new { Email = "fatma.ozkan@example.com", Content = "Düzenli müşteri, her ay sipariş veriyor. Çok memnun, referans verebilir.", CreatedBy = "user", DaysAgo = 10 },
                        new { Email = "fatma.ozkan@example.com", Content = "Yeni ürün kataloğu gönderildi. İlgi gösterdi, takip edilecek.", CreatedBy = "manager", DaysAgo = 6 },
                        new { Email = "ali.celik@example.com", Content = "Potansiyel müşteri, ilk temas kuruldu. İhtiyaç analizi yapılacak.", CreatedBy = "user", DaysAgo = 8 },
                        new { Email = "ali.celik@example.com", Content = "Müşteri fiyat listesi istedi. Teklif hazırlanıyor, 3 gün içinde gönderilecek.", CreatedBy = "admin", DaysAgo = 3 }
                    };

                    foreach (var noteData in defaultNotes)
                    {
                        var customer = allCustomers.FirstOrDefault(c => c.Email == noteData.Email);
                        if (customer != null)
                        {
                            // Bu müşteri için bu içerikte not var mı kontrol et
                            if (!existingNotes.Any(n => n.CustomerId == customer.Id && n.Content == noteData.Content))
                            {
                                notesToAdd.Add(new CustomerNote
                                {
                                    CustomerId = customer.Id,
                                    Content = noteData.Content,
                                    CreatedBy = noteData.CreatedBy,
                                    CreatedAt = DateTime.UtcNow.AddDays(-noteData.DaysAgo),
                                    UpdatedAt = DateTime.UtcNow.AddDays(-noteData.DaysAgo),
                                    IsActive = true
                                });
                            }
                        }
                    }

                    if (notesToAdd.Any())
                    {
                        context.CustomerNotes.AddRange(notesToAdd);
                        context.SaveChanges();
                        Console.WriteLine($"Added {notesToAdd.Count} new customer notes.");
                    }
                    else
                    {
                        Console.WriteLine("All default customer notes already exist.");
                    }
                    
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
