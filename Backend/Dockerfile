# Multi-stage Dockerfile for .NET 9.0
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Sadece sln ve csproj'ları kopyala (restore cache için)
COPY Backend/QuickCRM.sln ./
COPY Backend/QuickCRM.API/QuickCRM.API.csproj ./QuickCRM.API/
COPY Backend/QuickCRM.Application/QuickCRM.Application.csproj ./QuickCRM.Application/
COPY Backend/QuickCRM.Core/QuickCRM.Core.csproj ./QuickCRM.Core/
COPY Backend/QuickCRM.Infrastructure/QuickCRM.Infrastructure.csproj ./QuickCRM.Infrastructure/

# Restore dependencies
RUN dotnet restore QuickCRM.sln --verbosity minimal

# Geri kalan kodu kopyala
COPY Backend/. .

# Build ve publish
RUN dotnet build QuickCRM.sln -c Release -o /app/build --no-restore --verbosity minimal
RUN dotnet publish QuickCRM.API/QuickCRM.API.csproj -c Release -o /app/publish /p:UseAppHost=false --no-build --verbosity minimal

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health/live || exit 1

# Expose port
EXPOSE 8080

# Entry point
ENTRYPOINT ["dotnet", "QuickCRM.API.dll"]
