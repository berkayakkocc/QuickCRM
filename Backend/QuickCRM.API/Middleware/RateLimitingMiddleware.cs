using System.Collections.Concurrent;
using System.Net;

namespace QuickCRM.API.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private readonly ConcurrentDictionary<string, ClientInfo> _clients = new();
    private readonly int _permitLimit;
    private readonly int _windowInMinutes;

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _permitLimit = configuration.GetValue<int>("RateLimiting:PermitLimit", 100);
        _windowInMinutes = configuration.GetValue<int>("RateLimiting:WindowInMinutes", 1);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var clientIp = GetClientIpAddress(context);
        var now = DateTime.UtcNow;
        var windowStart = now.AddMinutes(-_windowInMinutes);

        var clientInfo = _clients.AddOrUpdate(clientIp, 
            new ClientInfo { RequestCount = 1, WindowStart = now },
            (key, existing) =>
            {
                if (existing.WindowStart < windowStart)
                {
                    // Reset window
                    return new ClientInfo { RequestCount = 1, WindowStart = now };
                }
                else
                {
                    // Increment counter
                    return new ClientInfo { RequestCount = existing.RequestCount + 1, WindowStart = existing.WindowStart };
                }
            });

        if (clientInfo.RequestCount > _permitLimit)
        {
            _logger.LogWarning("Rate limit exceeded for IP: {ClientIp}, RequestCount: {RequestCount}", 
                clientIp, clientInfo.RequestCount);
            
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers["Retry-After"] = (_windowInMinutes * 60).ToString();
            await context.Response.WriteAsync("Rate limit exceeded. Please try again later.");
            return;
        }

        // Add rate limit headers
        context.Response.Headers["X-RateLimit-Limit"] = _permitLimit.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = Math.Max(0, _permitLimit - clientInfo.RequestCount).ToString();
        context.Response.Headers["X-RateLimit-Reset"] = clientInfo.WindowStart.AddMinutes(_windowInMinutes).ToString("R");

        await _next(context);
    }

    private static string GetClientIpAddress(HttpContext context)
    {
        // Check for forwarded headers first
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private class ClientInfo
    {
        public int RequestCount { get; set; }
        public DateTime WindowStart { get; set; }
    }
}
