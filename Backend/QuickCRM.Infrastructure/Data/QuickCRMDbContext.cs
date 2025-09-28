using Microsoft.EntityFrameworkCore;
using QuickCRM.Core.Entities;
using Azure.Identity;
using Microsoft.Data.SqlClient;

namespace QuickCRM.Infrastructure.Data
{
    public class QuickCRMDbContext : DbContext
    {
        public QuickCRMDbContext(DbContextOptions<QuickCRMDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<CustomerNote> CustomerNotes { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Azure SQL Database için Azure Identity kullanımı
                var connectionString = optionsBuilder.Options.FindExtension<Microsoft.EntityFrameworkCore.SqlServer.Infrastructure.Internal.SqlServerOptionsExtension>()?.ConnectionString;
                
                if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("database.windows.net"))
                {
                    // Azure SQL Database için Azure Identity authentication
                    var credential = new DefaultAzureCredential();
                    var tokenRequestContext = new Azure.Core.TokenRequestContext(new[] { "https://database.windows.net/.default" });
                    var token = credential.GetToken(tokenRequestContext);
                    
                    var connection = new SqlConnection(connectionString);
                    connection.AccessToken = token.Token;
                    
                    optionsBuilder.UseSqlServer(connection);
                }
            }
            
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Customer entity configuration
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Company).HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // User entity configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // CustomerNote entity configuration
            modelBuilder.Entity<CustomerNote>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CustomerId).IsRequired();
                entity.Property(e => e.Content).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                
                // Foreign key relationship
                entity.HasOne(e => e.Customer)
                      .WithMany()
                      .HasForeignKey(e => e.CustomerId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                // Indexes
                entity.HasIndex(e => e.CustomerId);
                entity.HasIndex(e => e.CreatedBy);
            });
        }
    }
}
