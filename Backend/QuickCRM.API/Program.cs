using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using QuickCRM.Application.Services;
using QuickCRM.Core.Interfaces;
using QuickCRM.Infrastructure.Data;
using QuickCRM.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Health checks
builder.Services.AddHealthChecks();

// Database
builder.Services.AddDbContext<QuickCRMDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), 
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: new[] { 40613 } // Azure SQL Serverless auto-pause error
        )));

// Repositories
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Services
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IStatsService, StatsService>();

// Memory Cache
builder.Services.AddMemoryCache();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "https://localhost:3000",
                "http://localhost:5173",
                "https://localhost:5173",
                "https://quickcrm.vercel.app",
                "https://*.vercel.app"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Production'da da Swagger'ı aktifleştir
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuickCRM API v1");
        c.RoutePrefix = "swagger"; // Swagger UI'yi /swagger endpoint'inde göster
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapHealthChecks("/health");

// Database migration and seed data - run in background
_ = Task.Run(async () =>
{
    await Task.Delay(10000); // Wait 10 seconds for app to start
    
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();
        var maxRetries = 5;
        var retryDelay = TimeSpan.FromSeconds(15);
        
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                var context = services.GetRequiredService<QuickCRMDbContext>();
                
                // Test connection first
                if (context.Database.CanConnect())
                {
                    logger.LogInformation("Database connection successful, running migrations...");
                    context.Database.Migrate();
                    logger.LogInformation("Migrations completed successfully.");
                    
                    // Run seed data after migration
                    QuickCRM.API.Data.SeedData.Initialize(services);
                    logger.LogInformation("Seed data completed successfully.");
                    break;
                }
                else
                {
                    throw new Exception("Cannot connect to database");
                }
            }
            catch (Exception ex) when (IsTransientError(ex) && attempt < maxRetries)
            {
                logger.LogWarning($"Database operation attempt {attempt} failed: {ex.Message}. Retrying in {retryDelay.TotalSeconds} seconds...");
                await Task.Delay(retryDelay);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Database migration/seed failed after {attempt} attempts: {ex.Message}");
                if (attempt == maxRetries)
                {
                    logger.LogError("All database operations failed. App will continue without database.");
                }
            }
        }
    }
});

// Helper method to identify transient errors
static bool IsTransientError(Exception ex)
{
    if (ex.Message.Contains("40613") || ex.Message.Contains("Database is not currently available"))
        return true;
    if (ex.Message.Contains("timeout") || ex.Message.Contains("connection"))
        return true;
    if (ex.Message.Contains("208") || ex.Message.Contains("Invalid object name"))
        return true;
    if (ex.Message.Contains("forbidden by its access permissions"))
        return true;
    if (ex.Message.Contains("network-related") || ex.Message.Contains("instance-specific"))
        return true;
    return false;
}

app.Run();
