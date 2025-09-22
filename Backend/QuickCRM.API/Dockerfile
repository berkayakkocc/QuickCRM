# Azure App Service Dockerfile for .NET 9
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["Backend/QuickCRM.API/QuickCRM.API.csproj", "QuickCRM.API/"]
COPY ["Backend/QuickCRM.Application/QuickCRM.Application.csproj", "QuickCRM.Application/"]
COPY ["Backend/QuickCRM.Core/QuickCRM.Core.csproj", "QuickCRM.Core/"]
COPY ["Backend/QuickCRM.Infrastructure/QuickCRM.Infrastructure.csproj", "QuickCRM.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "QuickCRM.API/QuickCRM.API.csproj"

# Copy source code
COPY Backend/ .

# Build the application
WORKDIR "/src/QuickCRM.API"
RUN dotnet build "QuickCRM.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "QuickCRM.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables for Azure App Service
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80
ENV WEBSITES_PORT=80

ENTRYPOINT ["dotnet", "QuickCRM.API.dll"]