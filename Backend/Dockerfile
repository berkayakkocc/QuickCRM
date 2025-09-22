# Multi-stage Dockerfile for .NET 8.0
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY QuickCRM.sln ./

# Copy project files
COPY QuickCRM.API/QuickCRM.API.csproj QuickCRM.API/
COPY QuickCRM.Application/QuickCRM.Application.csproj QuickCRM.Application/
COPY QuickCRM.Core/QuickCRM.Core.csproj QuickCRM.Core/
COPY QuickCRM.Infrastructure/QuickCRM.Infrastructure.csproj QuickCRM.Infrastructure/

# Restore dependencies
RUN dotnet restore QuickCRM.sln

# Copy source code
COPY . .

# Build the application
RUN dotnet build QuickCRM.sln -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish QuickCRM.API/QuickCRM.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80
ENV PORT=80

# Expose port
EXPOSE 80

# Entry point
ENTRYPOINT ["dotnet", "QuickCRM.API.dll"]
