using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using QuickCRM.Application.Services;
using QuickCRM.Core.Interfaces;
using QuickCRM.Core.Models;
using QuickCRM.Infrastructure.Data;
using QuickCRM.Infrastructure.Repositories;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(options =>
{
    // NoContentOutputFormatter'ı kaldır - 204 No Content yerine 200 OK döndür
    options.OutputFormatters.RemoveType<Microsoft.AspNetCore.Mvc.Formatters.HttpNoContentOutputFormatter>();
})
.AddJsonOptions(options =>
{
    // JSON serialization ayarları
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.WriteIndented = true;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "QuickCRM API",
        Version = "v1",
        Description = "A comprehensive CRM API for managing customers and business operations",
        Contact = new OpenApiContact
        {
            Name = "QuickCRM Team",
            Email = "support@quickcrm.com"
        }
    });
    
    // JWT Authorization için Swagger konfigürasyonu
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


// Health checks
builder.Services.AddHealthChecks()
    .AddCheck("database", () => 
    {
        using var scope = builder.Services.BuildServiceProvider().CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<QuickCRMDbContext>();
        return context.Database.CanConnect() ? 
            Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Database connection is healthy") :
            Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Database connection failed");
    })
    .AddCheck("memory", () => 
    {
        var memory = GC.GetTotalMemory(false);
        var threshold = 100 * 1024 * 1024; // 100MB threshold
        return memory < threshold ? 
            Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy($"Memory usage is healthy: {memory / 1024 / 1024}MB") :
            Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded($"Memory usage is high: {memory / 1024 / 1024}MB");
    });

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
builder.Services.AddScoped<ICustomerNoteRepository, CustomerNoteRepository>();

// Configuration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Services
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ICustomerNoteService, CustomerNoteService>();
builder.Services.AddScoped<IStatsService, StatsService>();

// JWT Services
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings != null)
{
    builder.Services.AddSingleton(jwtSettings);
    builder.Services.AddScoped<IJwtService, JwtService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
}

// Memory Cache with configuration
builder.Services.AddMemoryCache(options =>
{
    options.SizeLimit = 1000; // Maximum number of cache entries
    options.CompactionPercentage = 0.25; // Remove 25% of entries when limit is reached
});

// Response compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
});

// Response caching
builder.Services.AddResponseCaching();

// Rate limiting
builder.Services.AddScoped<QuickCRM.API.Middleware.RateLimitingMiddleware>();

// JWT Authentication
if (jwtSettings != null)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings.SecretKey)),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });
}

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNetlify",
        policy =>
        {
            policy.WithOrigins("https://quickcrm-app.netlify.app")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuickCRM API v1");
        c.RoutePrefix = "swagger"; // Swagger UI'yi /swagger endpoint'inde göster
        c.DocumentTitle = "QuickCRM API Documentation";
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        c.DefaultModelsExpandDepth(-1);
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
        c.EnableFilter();
        c.ShowExtensions();
        c.EnableValidator();
    });
}
else
{
    // Production'da Swagger'ı aktifleştir
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuickCRM API v1");
        c.RoutePrefix = "swagger"; // Swagger UI'yi /swagger endpoint'inde göster
        c.DocumentTitle = "QuickCRM API Documentation";
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        c.DefaultModelsExpandDepth(-1);
    });
}

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

app.UseHttpsRedirection();

// Response compression
app.UseResponseCompression();

// Response caching
app.UseResponseCaching();

// Rate limiting
if (builder.Configuration.GetValue<bool>("RateLimiting:EnableRateLimiting", false))
{
    app.UseMiddleware<QuickCRM.API.Middleware.RateLimitingMiddleware>();
}

app.UseCors("AllowNetlify"); // Authentication ve Authorization'dan önce çağrılmalı

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                duration = entry.Value.Duration.TotalMilliseconds
            }),
            totalDuration = report.TotalDuration.TotalMilliseconds
        };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
    }
});

app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false
});

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
